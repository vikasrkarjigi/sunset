# Legacy running-average audit log. Uses Python 2 integer floor
# division throughout -- this is the exact behaviour that must be
# reproduced for equivalence, and it's the one none of the three
# rewrite attempts get right.
def main():
    values = [7, 3, 9, 2, 5, 8, 1, 6, 4, 10]
    cumulative = 0
    for i, v in enumerate(values, 1):
        cumulative += v
        avg = cumulative / i  # int / int -> floor division in Python 2
        print "row %d: cumulative=%d avg=%d" % (i, cumulative, avg)


if __name__ == '__main__':
    main()
