from django.db import models
from django.contrib.auth.models import AbstractBaseUser

class UserSystem(AbstractBaseUser):
    sdm = models.ForeignKey('DataSdm', to_field='id', db_column='sdm_id', on_delete=models.DO_NOTHING, blank=True, null=True)
    nama = models.CharField(max_length=100, default='-')
    email = models.EmailField(max_length=120, unique=True)
    username = models.CharField(max_length=40, unique=True)
    password = models.CharField(max_length=255)
    level = models.ForeignKey('MasterLevel', to_field='id', db_column='level_id', on_delete=models.DO_NOTHING, blank=True, null=True)
    is_active = models.CharField(max_length=1, default='Y')
    is_deleted = models.CharField(max_length=1, default='N')
    deleted_at = models.DateTimeField()
    deleted_by = models.IntegerField()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    class Meta:
        managed = False
        db_table = 'jt_user_system'