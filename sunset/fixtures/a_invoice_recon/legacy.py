# Invoice line-total reconciliation.
# Untouched since 2014. Nobody knows who wrote this anymore.
import csv


def main():
    f = open('invoices.csv', 'rb')
    reader = csv.reader(f)
    reader.next()  # skip header
    for row in reader:
        invoice_id, amount_str, qty_str = row[0], row[1], row[2]
        amount = float(amount_str)
        qty = int(qty_str)
        line_total = amount * qty
        print "%.2f" % line_total
    f.close()


if __name__ == '__main__':
    main()
