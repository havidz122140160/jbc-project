from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # Biar kolom 'role' dan 'no_wa' kelihatan di list admin
    list_display = ('username', 'email', 'role', 'no_wa', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'no_wa', 'is_active_staf')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'no_wa', 'is_active_staf')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)