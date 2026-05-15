"""
Synthetic Salesforce record generator.

Produces records in Salesforce REST API response shape, populated with
faker-generated values. Used for workflow demonstration only - no real
Salesforce data is ever extracted or processed by this module.

Every record carries `_synthetic: true` in its attributes block.
"""

import random
import string
from datetime import datetime, timedelta, timezone
from typing import Any

from faker import Faker

# Hard cap. Demonstration tool, not bulk generation.
MAX_RECORDS_PER_OBJECT = 500

# Realistic-looking Salesforce 18-character ID prefixes
SF_ID_PREFIXES = {
    "Contact": "003",
    "Lead": "00Q",
    "Account": "001",
    "User": "005",
}


def _sf_id(object_type: str, faker: Faker) -> str:
    """Generate a Salesforce-shaped 18-character record ID."""
    prefix = SF_ID_PREFIXES.get(object_type, "000")
    # 12 chars of base62-ish randomness + 3-char case-sensitivity suffix
    body = "".join(faker.random_choices(
        elements=string.ascii_letters + string.digits, length=12))
    suffix = "".join(faker.random_choices(
        elements=string.ascii_uppercase, length=3))
    return f"{prefix}{body}{suffix}"


def _iso_datetime(dt: datetime) -> str:
    """Salesforce-shaped ISO datetime with milliseconds and timezone."""
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000+0000")


def _attributes(object_type: str, record_id: str) -> dict[str, Any]:
    """Build the per-record attributes block that real SF responses include."""
    return {
        "type": object_type,
        "url": f"/services/data/v64.0/sobjects/{object_type}/{record_id}",
        "_synthetic": True,  # Marker. Real SF records will not have this.
    }


def _make_contact(faker: Faker) -> dict[str, Any]:
    record_id = _sf_id("Contact", faker)
    created = faker.date_time_between(start_date="-5y", end_date="-1y",
                                      tzinfo=timezone.utc)
    modified = faker.date_time_between(start_date=created, end_date="now",
                                       tzinfo=timezone.utc)

    first = faker.first_name()
    last = faker.last_name()

    # Identification number: deliberately heterogeneous to mirror the real-org
    # quality issue observed (short numerics mixed with 13-digit strings).
    id_format = faker.random_element(["short", "long", "empty"])
    if id_format == "short":
        ident = f"DEMO-{faker.random_number(digits=6, fix_len=True)}"
    elif id_format == "long":
        ident = f"DEMO-{faker.random_number(digits=13, fix_len=True)}"
    else:
        ident = None

    dietary = faker.random_element([None, None, None,
                                    "Vegetarian", "Halal", "Kosher",
                                    "Gluten-free", "Vegan"])

    return {
        "attributes": _attributes("Contact", record_id),
        "Id": record_id,
        "FirstName": first,
        "LastName": last,
        "Email": f"{first.lower()}.{last.lower()}@example.test",
        "MobilePhone": faker.numerify("+## ### ### ####"),
        "HomePhone": faker.numerify("+## ### ### ####") if faker.boolean(20) else None,
        "Birthdate": faker.date_of_birth(minimum_age=25, maximum_age=75).isoformat()
                     if faker.boolean(40) else None,
        "MailingCity": faker.city(),
        "MailingCountry": faker.random_element(
            ["South Africa", "United Kingdom", "United States",
             "Luxembourg", "Singapore"]),
        "Title": faker.job(),
        "AccountId": _sf_id("Account", faker),
        "Indentification_Number__c": ident,  # Typo preserved from real org
        "Dietary_Requirements__c": dietary,
        "LinkedIn_Profile__c": f"https://linkedin.example.test/in/{first.lower()}-{last.lower()}"
                               if faker.boolean(30) else None,
        "CreatedDate": _iso_datetime(created),
        "LastModifiedDate": _iso_datetime(modified),
    }


def _make_lead(faker: Faker) -> dict[str, Any]:
    record_id = _sf_id("Lead", faker)
    created = faker.date_time_between(start_date="-3y", end_date="-1m",
                                      tzinfo=timezone.utc)
    modified = faker.date_time_between(start_date=created, end_date="now",
                                       tzinfo=timezone.utc)

    first = faker.first_name()
    last = faker.last_name()

    return {
        "attributes": _attributes("Lead", record_id),
        "Id": record_id,
        "FirstName": first,
        "LastName": last,
        "Email": f"{first.lower()}.{last.lower()}@example.test",
        "Phone": faker.numerify("+## ### ### ####"),
        "MobilePhone": faker.numerify("+## ### ### ####") if faker.boolean(60) else None,
        "Company": faker.company(),
        "Title": faker.job(),
        "City": faker.city(),
        "Country": faker.random_element(
            ["South Africa", "United Kingdom", "United States",
             "Luxembourg", "Singapore"]),
        "Status": faker.random_element(
            ["Open - Not Contacted", "Working - Contacted",
             "Closed - Converted", "Closed - Not Converted"]),
        "LeadSource": faker.random_element(
            ["Web", "Phone Inquiry", "Partner Referral",
             "Purchased List", "Other"]),
        "Personal_Investing__c": faker.boolean(25),
        "Planning_for_Retirement__c": faker.boolean(15),
        "CreatedDate": _iso_datetime(created),
        "LastModifiedDate": _iso_datetime(modified),
    }


def generate(object_type: str, n: int = 50,
             seed: int = 42) -> dict[str, Any]:
    """
    Generate `n` synthetic records of the given object type.

    Returns a dict in Salesforce REST API response shape:
        {"totalSize": n, "done": True, "records": [...]}

    Deterministic for a given (object_type, n, seed).
    """
    if n > MAX_RECORDS_PER_OBJECT:
        raise ValueError(
            f"Requested {n} records exceeds cap of {MAX_RECORDS_PER_OBJECT}. "
            "This generator is for demonstration, not bulk generation."
        )

    faker = Faker("en_GB")
    Faker.seed(seed)
    random.seed(seed)

    if object_type == "Contact":
        records = [_make_contact(faker) for _ in range(n)]
    elif object_type == "Lead":
        records = [_make_lead(faker) for _ in range(n)]
    else:
        raise ValueError(
            f"Object type '{object_type}' not supported. "
            "Supported: Contact, Lead."
        )

    return {
        "totalSize": n,
        "done": True,
        "records": records,
    }


def generate_all(n_per_object: int = 50, seed: int = 42) -> dict[str, dict]:
    """Generate the full demo dataset: Contact + Lead."""
    return {
        "Contact": generate("Contact", n=n_per_object, seed=seed),
        "Lead": generate("Lead", n=n_per_object, seed=seed + 1),
    }


if __name__ == "__main__":
    # When run directly, write samples to disk for inspection.
    import json
    from pathlib import Path

    out_dir = Path(__file__).resolve().parents[2] / "samples"
    out_dir.mkdir(exist_ok=True)

    data = generate_all(n_per_object=50)
    for object_type, response in data.items():
        out_path = out_dir / f"{object_type.lower()}s.json"
        out_path.write_text(json.dumps(response, indent=2))
        print(f"Wrote {response['totalSize']} {object_type} records to {out_path}")
