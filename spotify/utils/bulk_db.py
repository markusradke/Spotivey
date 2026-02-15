"""
Bulk database operations for efficient data storage.
Reduces database writes from individual saves to single transactions.
"""

from typing import List, Tuple, Type
from django.db import models, transaction
from django.db.utils import IntegrityError
import time


def bulk_create_with_retry(
    model_class: Type[models.Model], 
    objects_list: List[models.Model], 
    batch_size: int = 100,
    max_retries: int = 3
) -> Tuple[int, List[models.Model]]:
    """
    Bulk create objects with retry logic for SQLite database locks.
    
    SQLite can have write contention issues. This function retries with
    exponential backoff if locks are encountered.
    
    Args:
        model_class: Django model class
        objects_list: List of unsaved model instances
        batch_size: Number of objects per database transaction
        max_retries: Maximum retry attempts for database locks
    
    Returns:
        Tuple of (created_count, failed_objects)
    """
    if not objects_list:
        return (0, [])
    
    created_count = 0
    failed_objects = []
    
    # Process in batches to avoid overwhelming SQLite
    for i in range(0, len(objects_list), batch_size):
        batch = objects_list[i:i + batch_size]
        
        for attempt in range(max_retries):
            try:
                with transaction.atomic():
                    created = model_class.objects.bulk_create(
                        batch,
                        batch_size=batch_size,
                        ignore_conflicts=False  # Raise error on duplicates
                    )
                    created_count += len(created)
                    break  # Success, exit retry loop
                    
            except IntegrityError as e:
                # Duplicate key or constraint violation
                # Try to identify which objects failed and save individually
                print(f"IntegrityError in bulk_create: {e}")
                for obj in batch:
                    try:
                        obj.save()
                        created_count += 1
                    except IntegrityError:
                        failed_objects.append(obj)
                break  # Don't retry IntegrityErrors
                
            except Exception as e:
                # Database lock or other error
                if attempt < max_retries - 1:
                    # Exponential backoff
                    wait_time = 0.1 * (2 ** attempt)
                    print(f"Database error (attempt {attempt + 1}/{max_retries}): {e}")
                    print(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    # Final attempt failed, save individually
                    print(f"Bulk create failed after {max_retries} attempts: {e}")
                    for obj in batch:
                        try:
                            obj.save()
                            created_count += 1
                        except Exception:
                            failed_objects.append(obj)
    
    return (created_count, failed_objects)


def bulk_update_fields(
    queryset: models.QuerySet,
    field_updates: dict,
    batch_size: int = 100
) -> int:
    """
    Bulk update specific fields on a queryset.
    
    More efficient than updating objects individually in a loop.
    
    Args:
        queryset: Django queryset to update
        field_updates: Dict of field_name: value to update
        batch_size: Number of objects per update transaction
    
    Returns:
        Number of objects updated
    
    Example:
        bulk_update_fields(
            SavedTrack.objects.filter(participant=participant),
            {'confirm': True},
            batch_size=50
        )
    """
    updated_count = queryset.update(**field_updates)
    return updated_count


def bulk_update_objects(
    objects_list: List[models.Model],
    fields: List[str],
    batch_size: int = 100
) -> int:
    """
    Bulk update modified objects using Django's bulk_update.
    
    Use when you need to update different values across objects,
    not just set all to the same value.
    
    Args:
        objects_list: List of modified model instances
        fields: List of field names that were modified
        batch_size: Number of objects per update transaction
    
    Returns:
        Number of objects updated
    
    Example:
        tracks = SavedTrack.objects.filter(participant=participant)
        for track in tracks:
            track.confirm = True
            track.popularity = calculate_popularity(track)
        bulk_update_objects(tracks, ['confirm', 'popularity'])
    """
    if not objects_list:
        return 0
    
    model_class = type(objects_list[0])
    
    # Use Django's bulk_update
    model_class.objects.bulk_update(
        objects_list,
        fields,
        batch_size=batch_size
    )
    
    return len(objects_list)