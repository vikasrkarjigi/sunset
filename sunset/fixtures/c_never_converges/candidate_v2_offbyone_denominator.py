# Attempt 2: "fixed" the rounding, but the fix introduced an off-by-one
# denominator bug -- every row is now wrong in a different way.
def main():
    values = [7, 3, 9, 2, 5, 8, 1, 6, 4, 10]
    cumulative = 0
    for i, v in enumerate(values, 1):
        cumulative += v
        avg = cumulative // (i + 1)
        print("row %d: cumulative=%d avg=%d" % (i, cumulative, avg))


if __name__ == '__main__':
    main()
