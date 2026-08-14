# Straightforward Python 3 port. Passes on first attempt -- the fast
# happy path in the demo arc.
import csv


def main():
    with open('inventory.csv', 'r', newline='') as f:
        reader = csv.reader(f)
        next(reader)
        items = []
        for row in reader:
            product_id, qty_str = row[0], row[1]
            items.append((product_id, int(qty_str)))
        items.sort()
        total = 0
        for product_id, qty in items:
            print("%s: %d" % (product_id, qty))
            total += qty
        print("TOTAL: %d" % total)


if __name__ == '__main__':
    main()
