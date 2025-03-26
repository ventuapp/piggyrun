
tarball:
	tar -czvf ../tmp/piggyrun.tar.gz public

assets:
	ssh damian@osvps1 mkdir -p /opt/www/Ventu/Games/public/g/piggyrun/audio
	ssh damian@osvps2 mkdir -p /opt/www/Ventu/Games/public/g/piggyrun/audio
	ssh damian@osvps1 mkdir -p /opt/www/Ventu/Games/public/g/piggyrun/icons
	ssh damian@osvps2 mkdir -p /opt/www/Ventu/Games/public/g/piggyrun/icons
	scp -r audio/* damian@osvps1:/opt/www/Ventu/Games/public/g/piggyrun/audio/
	scp -r audio/* damian@osvps2:/opt/www/Ventu/Games/public/g/piggyrun/audio/
	scp -r icons/* damian@osvps1:/opt/www/Ventu/Games/public/g/piggyrun/icons/
	scp -r icons/* damian@osvps2:/opt/www/Ventu/Games/public/g/piggyrun/icons/

push_scripts:
	ssh damian@osvps1 mkdir -p /opt/www/Ventu/Games/scripts
	ssh damian@osvps2 mkdir -p /opt/www/Ventu/Games/scripts
	scp scripts/del_assets.sh damian@osvps1:/opt/www/Ventu/Games/scripts/
	scp scripts/del_assets.sh damian@osvps2:/opt/www/Ventu/Games/scripts/
	ssh damian@osvps1 chmod +x /opt/www/Ventu/Games/scripts/del_assets.sh
	ssh damian@osvps2 chmod +x /opt/www/Ventu/Games/scripts/del_assets.sh

deploy:
	pnpm build
	ssh damian@osvps1 /opt/www/Ventu/Games/scripts/del_assets.sh
	scp -r dist/* damian@osvps1:/opt/www/Ventu/Games/public/g/piggyrun
	ssh damian@osvps2 /opt/www/Ventu/Games/scripts/del_assets.sh
	scp -r dist/* damian@osvps2:/opt/www/Ventu/Games/public/g/piggyrun

build:
	pnpm build

