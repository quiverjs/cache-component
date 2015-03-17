BABEL_FLAGS=--blacklist=es6.blockScoping,es6.constants,es6.forOf,regenerator 

build: src
	babel src --out-dir out $(BABEL_FLAGS)

clear-temp:
	rm -r temp/ && mkdir temp

test: build clear-temp
	mocha out/test

.PHONY: build test server clear-temp