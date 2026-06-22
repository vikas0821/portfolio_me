"""Standard-normal PDF/CDF without a scipy dependency."""

import math


def norm_pdf(x: float) -> float:
    return math.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)


def norm_cdf(x: float) -> float:
    # Uses the error function for an accurate CDF.
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))
