VPATH=src
BUILDDIR=lib

BEANDIR=.
JSONDIR=.

COFFEE_SOURCES= $(wildcard $(VPATH)/*.coffee)
COFFEE_OBJECTS=$(patsubst $(VPATH)/%.coffee, $(BUILDDIR)/%.js, $(COFFEE_SOURCES))

CLIENT_JS_FILES = $(wildcard client/*.coffee)

all: build

.PHONY: build
build: node_modules objects

.PHONY: objects
objects: $(COFFEE_OBJECTS) 

.PHONY: test
test: build
	npm test

.PHONY: clean
clean:
	rm -f $(COFFEE_OBJECTS)

.PHONE: pristine
pristine: clean
	rm -rf node_modules

node_modules:
	npm install -d

$(BUILDDIR)/%.js: $(VPATH)/%.coffee
	./node_modules/.bin/coffee -o $(BUILDDIR) -c $<

.PHONY: watch
watch:
	./node_modules/.bin/coffee --watch -o $(BUILDDIR) -c $(VPATH)

.PHONY: start
start:	all
	./node_modules/.bin/supervisor -w routes,views,lib,src -e coffee,hbs,js,json -q server.js

