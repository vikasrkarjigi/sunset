# Attempt 2: preserves the legacy %.2f formatting behaviour exactly,
# per the structured feedback from attempt 1's divergence report.
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
            print("%.2f" % line_total)


if __name__ == '__main__':
    main()
