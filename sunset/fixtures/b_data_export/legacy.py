# Nightly inventory export. Straightforward -- modernizes cleanly.
import csv


def main():
    f = open('inventory.csv', 'rb')
    reader = csv.reader(f)
    reader.next()
    items = []
    for row in reader:
        product_id, qty_str = row[0], row[1]
        items.append((product_id, int(qty_str)))
    items.sort()
    total = 0
    for product_id, qty in items:
        print "%s: %d" % (product_id, qty)
        total += qty
    print "TOTAL: %d" % total
    f.close()


if __name__ == '__main__':
    main()
