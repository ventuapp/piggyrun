
tarball:
	tar -czvf ../tmp/piggyrun.tar.gz public

deploy:
	pnpm build
	ssh damian@osvps1 mkdir -p /opt/www/Ventu/Games/public/piggyrun
	ssh damian@osvps2 mkdir -p /opt/www/Ventu/Games/public/piggyrun
	scp -r dist/* damian@osvps1:/opt/www/Ventu/Games/public/piggyrun
	scp -r dist/* damian@osvps2:/opt/www/Ventu/Games/public/piggyrun