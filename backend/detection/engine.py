from .rules import run_rules


def calculate_risk(process):
    """
    Evaluates detection rules against a process and computes the aggregate risk score and severity level.
    """
    findings = run_rules(process)
    total_score = sum(finding["score"] for finding in findings)

    if total_score >= 40:
        level = "HIGH"
    elif total_score >= 20:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "score": total_score,
        "level": level,
        "findings": findings
    }