SVGS=$(wildcard *.svg)
PNGS=$(SVGS:%.svg=%.png)

all: $(PNGS)
clean:
	rm -f *.png

%.png: %.svg
#	rsvg-convert --width=500 --height=500 $< > $@
	inkscape $< --export-png=$@ -w 500 -h 500
	optipng $@

