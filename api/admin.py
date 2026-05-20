from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from api.models import RetrievalSetting, Researcher
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

# Define Inline admin descriptor for Researcher model
class ResearcherInline(admin.StackedInline):
    model = Researcher
    can_delete = False
    verbose_name_plural = 'researcher'

class UserAdmin(BaseUserAdmin):
    inlines = [ResearcherInline]

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(RetrievalSetting)
