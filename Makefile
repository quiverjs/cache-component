TRACEUR_FLAGS=--modules commonjs --generators parse --block-binding parse

build: src
	traceur --dir src/ out/ $(TRACEUR_FLAGS)

unit-test: build clear-temp
	mocha out/test

clear-temp: temp
	rm -rf temp/ && mkdir temp

.PHONY: build build-lib build-test test