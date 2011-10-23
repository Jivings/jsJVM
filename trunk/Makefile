PACKAGE     = coffee-jvm
VERSION      = ` date "+%Y.%m%d%" `
BIN_DIR  = ./bin
RELEASE_DIR = ./dist
SUBDIRS = classloader jvm exception
MAKE = coffee
DIR = $(CURDIR)/src
COFFEE_FILES = 
OUTPUT_DIR = $(CURDIR)/bin/js

# target: all - Default target. Does nothing.
all:
	@cd src; \
	for dir in $(SUBDIRS); do \
	  cd $$dir; \
	  for file in *.coffee; do \
		$(MAKE) -o $(OUTPUT_DIR) -c $$file; \
	  done; \
	  cd $(DIR); \
	done; \
 
# target: help - Display callable targets.
help:
	egrep "^# target:" [Mm]akefile
 
# target: list - List source files
list:
	@cd src; \
	ls -R
 
# target: dist - Make a release.
dist:
	@cd src; \
	
