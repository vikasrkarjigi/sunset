# Attempt 1: naive Python 3 port.
import csv


def main():
    with open('invoices.csv', 'r', newline='') as f:
        reader = csv.reader(f)
        next(reader)  # skip header
        for row in reader:
            invoice_id, amount_str, qty_str = row[0], row[1], row[2]
            amount = float(amount_str)
            qty = int(qty_str)
            line_total = amount * qty
            print(line_total)


if __name__ == '__main__':
    main()
