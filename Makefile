
all: build test

build:
	./node_modules/.bin/gulp

test: build
	rm -rf temp/
	mkdir temp
	@NODE_ENV=test ./node_modules/.bin/mocha es5/test;

.PHONY: build test
