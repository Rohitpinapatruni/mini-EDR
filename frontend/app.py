import streamlit as st
import requests
import pandas as pd
import plotly.express as px


API = "http://127.0.0.1:8000"


st.set_page_config(
    page_title="Windows Mini EDR",
    layout="wide"
)


st.title("🛡️ Windows Mini-EDR")

st.caption(
    "Endpoint Detection and Response Dashboard"
)


# -------------------------
# Statistics
# -------------------------

try:

    stats = requests.get(
        f"{API}/stats"
    ).json()

except Exception:

    st.error(
        "Cannot connect to FastAPI backend."
    )

    st.stop()


col1, col2, col3, col4 = st.columns(4)


col1.metric(
    "Processes Analyzed",
    stats["total"]
)

col2.metric(
    "High Risk",
    stats["high"]
)

col3.metric(
    "Medium Risk",
    stats["medium"]
)

col4.metric(
    "Low Risk",
    stats["low"]
)


st.divider()


# -------------------------
# Current Processes
# -------------------------

st.header("Running Processes")


processes = requests.get(
    f"{API}/processes"
).json()


if processes:

    df = pd.DataFrame(processes)

    st.dataframe(
        df[
            [
                "pid",
                "name",
                "exe_path",
                "parent_pid",
                "cpu_percent",
                "memory_percent"
            ]
        ],
        use_container_width=True
    )


# -------------------------
# Alerts
# -------------------------

st.header("Security Alerts")


alerts = requests.get(
    f"{API}/alerts"
).json()


if alerts:

    alert_df = pd.DataFrame(alerts)

    st.dataframe(
        alert_df[
            [
                "created_at",
                "pid",
                "process_name",
                "severity",
                "score",
                "description"
            ]
        ],
        use_container_width=True
    )

else:

    st.success(
        "No security alerts detected."
    )


# -------------------------
# Risk Distribution
# -------------------------

st.header("Risk Distribution")


risk_data = pd.DataFrame({

    "Risk": [
        "LOW",
        "MEDIUM",
        "HIGH"
    ],

    "Count": [
        stats["low"],
        stats["medium"],
        stats["high"]
    ]

})


fig = px.bar(
    risk_data,
    x="Risk",
    y="Count",
    title="Process Risk Distribution"
)


st.plotly_chart(
    fig,
    use_container_width=True
)


# -------------------------
# Network Connections
# -------------------------

st.header("Network Connections")


network = requests.get(
    f"{API}/network"
).json()


if network:

    network_df = pd.DataFrame(network)

    st.dataframe(
        network_df,
        use_container_width=True
    )


# -------------------------
# Refresh
# -------------------------

if st.button("Refresh"):

    st.rerun()