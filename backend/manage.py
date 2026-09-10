import os,sys
from pathlib import Path

# Make the documented command work even when the shell was not activated.
# Prefer the repository virtualenv so dependencies such as django-cors-headers
# are loaded consistently. Set RISE_NO_AUTO_VENV=1 to disable this behaviour.
if __name__=='__main__' and not os.getenv('RISE_NO_AUTO_VENV') and sys.prefix==sys.base_prefix:
    here=Path(__file__).resolve()
    candidates=[here.parents[2]/'.venv/bin/python',here.parent/'.venv/bin/python']
    for python_bin in candidates:
        if python_bin.exists():
            os.execv(str(python_bin),[str(python_bin),str(here),*sys.argv[1:]])
            break
if __name__=='__main__':
 os.environ.setdefault('DJANGO_SETTINGS_MODULE','rise.settings')
 from django.core.management import execute_from_command_line
 execute_from_command_line(sys.argv)
