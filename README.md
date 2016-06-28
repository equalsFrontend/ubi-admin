## UBI Administration Panel

## -------  Frontend deployment ---------

# Deploy the microsite front-end (with tag 2.0.10):
ansible-playbook deploy_maif_microsite.yml -i integration/hosts --extra-vars "dir=tags version=2.0.10" -u deploymng -l saas-maif-microsite

# Deploy the microsite front-end (with branch 2.0.x to get latest SNAPSHOT):
ansible-playbook deploy_maif_microsite.yml -i integration/hosts --extra-vars "dir=branches version=2.0.x" -u deploymng -l saas-maif-microsite

# Disbale/Enable maintenance mode in frontend (MAIF Microsite):
ansible-playbook maif_maintenance_mode.yml -e mode=prod -i integration/hosts -u deploymng -l saas-maif-microsite
ansible-playbook maif_maintenance_mode.yml -e mode=maintenance -i integration/hosts -u deploymng -l saas-maif-microsite



# Deploy the UBI Driver and UBI Admin frontend modules (with version 2.0.10):
ansible-playbook deploy_saas_frontend.yml -i integration/hosts --extra-vars "version=2.0.10" -u deploymng -l saas-ubi-frontend

# Deploy the UBI Driver and UBI Admin frontend modules (with version 2.0.10-SNAPSHOT):
ansible-playbook deploy_saas_frontend.yml -i integration/hosts --extra-vars "version=2.0.10-SNAPSHOT" -u deploymng -l saas-ubi-frontend

# Deploy the UBI Driver frontend module only (with version 2.0.10-SNAPSHOT):
ansible-playbook deploy_saas_frontend.yml -i integration/hosts --extra-vars "version=2.0.10-SNAPSHOT" -u deploymng -l saas-ubidriver-frontend

# Deploy the UBI Admin frontend module only (with version 0.2.0-SNAPSHOT):
ansible-playbook deploy_saas_frontend.yml -i integration/hosts --extra-vars "version=0.2.0-SNAPSHOT" -u deploymng -l saas-ubiadmin-frontend

# Deploy the GlobsterViewer tool frontend (with version 2.0.10-SNAPSHOT):
ansible-playbook deploy_saas_frontend.yml -i integration/hosts --extra-vars "version=2.0.10-SNAPSHOT" -u deploymng -l tools-frontend
ansible-playbook deploy_saas_frontend.yml -i integration/hosts --extra-vars "version=2.0.10-SNAPSHOT" -u deploymng -l tool-globsterviewer-frontend



# Just replace properties of backend modules.
ansible-playbook replace_properties.yml -i prod/hosts -u thierry.leveque --ask-pass -k -b --ask-become-pass --become-user=imservice -l maas-dtls-cruncher
ansible-playbook replace_properties.yml -i integration/hosts -u deploymng -l maas-dtls-cruncher

# Restart instance of backend modules only (not frontend)
ansible-playbook restart_apps.yml -i integration/hosts -u deploymng -l maas-dtls-controller

# Setup Python and required modules on remote hosts
ansible-playbook setup_python.yml -i prod/hosts -u eric.lacoursiere --ask-pass -k -b --ask-become-pass