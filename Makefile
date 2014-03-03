SVGS=*.svg
PNGS=$(SVGS:%.svg=%.png)

all: $(PNGS)
clean:
	rm *.png

%.png: %.svg
	rsvg-convert --width=500 --height=500 $< > $@
	optipng $@

