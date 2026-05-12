from django.contrib import admin
from .models import *
# Register your models here.
import csv
from django.http import HttpResponse


@admin.action(description='export_as_csv')
def export_as_csv(self, request, queryset):
    meta = self.model._meta
    field_names = [field.name for field in meta.fields]

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
    writer = csv.writer(response)

    writer.writerow(field_names)
    for obj in queryset:
        row = writer.writerow([getattr(obj, field) for field in field_names])

    return response

@admin.action(description='Mark selected stories as published')
def make_published(modeladmin, request, queryset):
    queryset.update(status='p')
    
admin.site.register(Participant)
admin.site.register(SavedTrack)
admin.site.register(TopTrackShortTerm)
admin.site.register(TopTrackMediumTerm)
admin.site.register(TopTrackLongTerm)
admin.site.register(TopArtistShortTerm)
admin.site.register(TopArtistMediumTerm)
admin.site.register(TopArtistLongTerm)
admin.site.register(FollowedArtist)
admin.site.register(RecentTrack)
admin.site.register(ParticipantProfile)
admin.site.register(CurrentPlaylist)
admin.site.register(SavedEpisode)
admin.site.register(SavedShow)