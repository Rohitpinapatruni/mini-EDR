import os


def check_location(process):

    path = process.get("exe_path")

    if not path:
        return 0, None

    path_lower = path.lower()

    suspicious_locations = [
        "\\appdata\\local\\temp\\",
        "\\windows\\temp\\",
        "\\downloads\\"
    ]

    for location in suspicious_locations:

        if location in path_lower:

            return (
                25,
                f"Executable is running from {location}"
            )

    return 0, None


def check_suspicious_parent(process):

    name = process.get("name", "").lower()

    parent_pid = process.get("parent_pid")

    if not parent_pid:
        return 0, None

    try:

        parent = __import__("psutil").Process(parent_pid)

        parent_name = parent.name().lower()

    except Exception:

        return 0, None

    # Conservative heuristic:
    # flag unusual scripting-child relationships for review.

    scripting_parents = {
        "powershell.exe",
        "wscript.exe",
        "cscript.exe"
    }

    if parent_name in scripting_parents:

        return (
            20,
            f"Process was launched by {parent_name}"
        )

    return 0, None


def check_unsigned(process):

    # Placeholder for Windows signature verification.
    #
    # We'll implement this in the next stage.
    #
    return 0, None


def run_rules(process):

    results = []

    rules = [
        check_location,
        check_suspicious_parent,
        check_unsigned
    ]

    for rule in rules:

        score, reason = rule(process)

        if score > 0:

            results.append({
                "score": score,
                "reason": reason
            })

    return results