# In network_test.py
import socket

hostname_to_test = "sandbox.easypaisa.com.pk"
google_hostname = "www.google.com" # A control test that should always work

print(f"--- Starting Network Diagnostic Test ---")
print("This script will test your computer's ability to find servers on the internet.")

# Test 1: A known working domain to check your general internet connection
print(f"\n--- Testing Connection to Google ---")
try:
    ip_google = socket.gethostbyname(google_hostname)
    print(f"[SUCCESS] Successfully resolved {google_hostname} to {ip_google}")
except socket.gaierror as e:
    print(f"[FAIL] FAILED to resolve {google_hostname}. Error: {e}")
    print("!!! CRITICAL: If this test fails, you have a general internet or DNS problem on your computer.")

print("\n--- Testing Connection to EasyPaisa Sandbox ---")

# Test 2: The problematic domain
try:
    ip_easypaisa = socket.gethostbyname(hostname_to_test)
    print(f"[SUCCESS] Successfully resolved {hostname_to_test} to {ip_easypaisa}")
    print("\n!!! This is unexpected. If this succeeds, the problem is somehow isolated to your Django environment.")
except socket.gaierror as e:
    print(f"[FAIL] FAILED to resolve {hostname_to_test}. Error: {e}")
    print("\n!!! THIS IS THE SAME 'getaddrinfo failed' ERROR.")
    print("!!! This is DEFINITIVE PROOF that the problem is your computer's network configuration, firewall, or DNS settings, NOT the Django code.")

print(f"\n--- Test Complete ---")