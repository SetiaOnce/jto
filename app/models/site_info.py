from django.db import models

class SiteInfo(models.Model):
    id = models.AutoField(primary_key=True)
    app_version = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    copyright = models.TextField()
    login_bg = models.TextField()
    login_logo = models.TextField()
    headbackend_logo = models.TextField()
    headbackend_logo_dark = models.TextField()
    headbackend_icon = models.TextField()
    headbackend_icon_dark = models.TextField()
    timezone = models.IntegerField()
    updated_at = models.DateTimeField()

    def __str__(self):
        return self.name
    
    class Meta:
        managed = False
        db_table = 'jt_site_info'