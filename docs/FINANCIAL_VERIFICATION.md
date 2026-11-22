# Deterministic financial verification

All internal money is integer paise; displayed/API values below are rupees.

| Measure | Plan: 100 units | Actual: 70 units | Actual: 130 units |
|---|---:|---:|---:|
| Selling price | ₹99 | ₹99 | ₹99 |
| Making cost/unit | ₹45 | ₹45 | ₹45 |
| Unit contribution | ₹54 | ₹54 | ₹54 |
| Revenue | ₹9,900 | ₹6,930 | ₹12,870 |
| Variable costs | ₹4,500 | ₹3,150 | ₹5,850 |
| Promotion spend | ₹1,500 | ₹1,500 | ₹1,500 |
| Contribution before promotion | ₹5,400 | ₹3,780 | ₹7,020 |
| Contribution after promotion | **₹3,900** | **₹2,280** | **₹5,520** |
| Cumulative promotion break-even | 28 units | 28 units | 28 units |
| Target achieved | 100% | 70% | 130% |
| Contribution variance | — | −₹1,620 | +₹1,620 |

Break-even is `ceil(1500 / (99−45)) = 28` units across the **entire seven-day experiment**, not per day. If unit contribution is zero or negative, no finite promotion break-even is displayed.

This is modeled contribution, **not net profit**. Rent, salaries, taxes and any unmodeled costs are excluded.

Negative margins, negative/zero observed contribution, insufficient activity, on-target outcomes, below-target positive and above-target positive outcomes have explicit learning branches. Recommendations are hypotheses, not claims of causation.

These exact two positive outcomes were checked in unit tests, real API-backed browser flows and actual OpenAI readings of saved experiments. Sample result buttons populate forms only; owner confirmation and Save are required.
