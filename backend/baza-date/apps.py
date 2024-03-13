from django.apps import AppConfig

class WorktimeManagerConfig(AppConfig):
    name = 'worktimemanager'

    def ready(self):
        import worktimemanager.signals  
