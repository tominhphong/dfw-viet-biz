#!/usr/bin/env python3
"""
Add Google Maps Links to Vietnamese Business Database
Uses Google Places API to get precise place_id and create direct links.
"""

import csv
import json
import time
import urllib.parse
import urllib.request
import ssl
from datetime import datetime
from pathlib import Path

# Configuration
API_KEY = "AIzaSyCx1svHnw4N-LJWNru40dT8JFmz4X4k9po"
INPUT_FILE = "/Volumes/homes/phongto/CSV Template/(300) Vietnamese_Businesses_Garland_Full_Database.csv"
OUTPUT_FILE = "/Volumes/homes/phongto/GitHub/dfw-viet-biz/Vietnamese_Businesses_WITH_MAPS_VERIFIED.csv"
REPORT_FILE = "/Volumes/homes/phongto/GitHub/dfw-viet-biz/maps_processing_report.txt"

# API Settings
PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
RATE_LIMIT_DELAY = 0.2  # 200ms between requests to avoid rate limits
TEST_MODE = False  # Set to True to only process first 5 rows
TEST_COUNT = 5

# SSL context for HTTPS requests (disable verification for macOS compatibility)
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

def call_places_api(business_name, address, state, zip_code):
    """Call Google Places API to find place_id for a business."""
    # Build search query
    search_query = f"{business_name} {address} {state} {zip_code}"
    
    # Build API URL
    params = {
        "input": search_query,
        "inputtype": "textquery",
        "fields": "place_id,name,formatted_address",
        "key": API_KEY
    }
    url = f"{PLACES_API_URL}?{urllib.parse.urlencode(params)}"
    
    try:
        # Make request
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, context=ssl_context, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            # Extract place_id if found
            if data.get("status") == "OK" and data.get("candidates"):
                candidate = data["candidates"][0]
                return {
                    "success": True,
                    "place_id": candidate.get("place_id"),
                    "name": candidate.get("name"),
                    "formatted_address": candidate.get("formatted_address")
                }
            else:
                return {"success": False, "error": data.get("status", "NO_RESULTS")}
                
    except Exception as e:
        return {"success": False, "error": str(e)}

def create_google_maps_link(place_id):
    """Create Google Maps link from place_id."""
    return f"https://www.google.com/maps/place/?q=place_id:{place_id}"

def create_fallback_link(business_name, address, state, zip_code):
    """Create fallback search link if no place_id found."""
    query = f"{business_name} {address} {state} {zip_code}"
    encoded_query = urllib.parse.quote(query)
    return f"https://www.google.com/maps/search/?api=1&query={encoded_query}"

def process_businesses():
    """Main processing function."""
    print(f"📂 Reading CSV file: {INPUT_FILE}")
    
    # Statistics
    stats = {
        "total": 0,
        "success_place_id": 0,
        "fallback_search": 0,
        "failed": 0,
        "skipped": 0
    }
    
    failed_entries = []
    results = []
    
    # Read CSV
    with open(INPUT_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f)
        header = next(reader)  # Skip header
        
        # Add new column to header
        header.append("Google_Maps_Link")
        header.append("Link_Type")
        results.append(header)
        
        for idx, row in enumerate(reader, start=1):
            if TEST_MODE and idx > TEST_COUNT:
                print(f"\n🛑 TEST MODE: Stopped after {TEST_COUNT} rows")
                break
            
            stats["total"] += 1
            
            # Extract data (Column A=0, D=3, E=4, F=5)
            try:
                business_name = row[0].strip() if len(row) > 0 else ""
                address = row[3].strip() if len(row) > 3 else ""
                state = row[4].strip() if len(row) > 4 else ""
                zip_code = row[5].strip() if len(row) > 5 else ""
            except Exception as e:
                print(f"⚠️  Row {idx}: Error reading data - {e}")
                stats["skipped"] += 1
                row.extend(["", "SKIPPED"])
                results.append(row)
                continue
            
            if not business_name:
                print(f"⚠️  Row {idx}: No business name, skipping")
                stats["skipped"] += 1
                row.extend(["", "SKIPPED"])
                results.append(row)
                continue
            
            # Call Places API
            print(f"🔍 [{idx}] {business_name[:40]}...", end=" ", flush=True)
            
            api_result = call_places_api(business_name, address, state, zip_code)
            
            if api_result["success"] and api_result.get("place_id"):
                # Success - use place_id link
                link = create_google_maps_link(api_result["place_id"])
                row.extend([link, "PLACE_ID"])
                stats["success_place_id"] += 1
                print(f"✅ Found: {api_result.get('name', 'N/A')[:30]}")
            else:
                # Fallback to search link
                link = create_fallback_link(business_name, address, state, zip_code)
                row.extend([link, "SEARCH"])
                stats["fallback_search"] += 1
                print(f"⚠️  Fallback: {api_result.get('error', 'No match')}")
                failed_entries.append({
                    "row": idx,
                    "name": business_name,
                    "error": api_result.get("error", "Unknown")
                })
            
            results.append(row)
            
            # Rate limiting
            time.sleep(RATE_LIMIT_DELAY)
    
    # Write output CSV
    print(f"\n📝 Writing output file: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(results)
    
    # Generate report
    print(f"📊 Generating report: {REPORT_FILE}")
    
    report_lines = [
        "=" * 60,
        "VIETNAMESE BUSINESS DATABASE - GOOGLE MAPS LINK REPORT",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "=" * 60,
        "",
        "SUMMARY",
        "-" * 40,
        f"Total Businesses Processed: {stats['total']}",
        f"Successfully Matched (Place ID): {stats['success_place_id']}",
        f"Fallback Search Links: {stats['fallback_search']}",
        f"Skipped (No Data): {stats['skipped']}",
        "",
        f"Success Rate: {(stats['success_place_id']/stats['total']*100):.1f}%" if stats['total'] > 0 else "N/A",
        "",
        "FILES GENERATED",
        "-" * 40,
        f"Output CSV: {OUTPUT_FILE}",
        f"Report: {REPORT_FILE}",
        ""
    ]
    
    if failed_entries:
        report_lines.extend([
            "ENTRIES REQUIRING MANUAL REVIEW",
            "-" * 40,
        ])
        for entry in failed_entries[:50]:  # Show first 50
            report_lines.append(f"Row {entry['row']}: {entry['name'][:50]} - {entry['error']}")
        
        if len(failed_entries) > 50:
            report_lines.append(f"... and {len(failed_entries) - 50} more")
    
    report_lines.extend(["", "=" * 60])
    
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    
    # Print summary
    print("\n" + "=" * 60)
    print("✅ PROCESSING COMPLETE")
    print("=" * 60)
    print(f"Total Processed: {stats['total']}")
    print(f"Place ID Links: {stats['success_place_id']} ✅")
    print(f"Search Links: {stats['fallback_search']} ⚠️")
    print(f"Skipped: {stats['skipped']}")
    print(f"Success Rate: {(stats['success_place_id']/stats['total']*100):.1f}%" if stats['total'] > 0 else "N/A")
    print("=" * 60)
    
    return stats

if __name__ == "__main__":
    process_businesses()
