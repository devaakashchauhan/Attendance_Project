import tkinter as tk
import requests
from pynput import keyboard
import threading
import time
import subprocess
import subprocess
from tkinter.simpledialog import askstring


# API details
API_URL = "https://attendance-project-3t8h.onrender.com/api/v1/users/attendances"
SPECIAL_RFID = "2761228716"  # Special RFID
rfid_input = []
last_input_time = 0
debounce_time = 1  # Adjust debounce time as needed (in seconds)
input_lock = threading.Lock()

# Function to call the REST API
def call_api(rfid):
    try:
        response = requests.post(API_URL, json={"rfid": rfid})
        response.raise_for_status()  # Raise error for bad status codes
        return response.status_code, response.json()
    except requests.RequestException as e:
        return None, str(e)

# Function to handle API response and update the UI
def update_status(rfid):
    if rfid == SPECIAL_RFID:
        stop_service()
        return

    status_code, response = call_api(rfid)
    if status_code:
        status_label.config(text=f"Success: {status_code}", fg="green")
        print(response)  # Or process the response as needed
    else:
        status_label.config(text=f"Failed: {response}", fg="red")

    # Clear the message after 3 seconds
    root.after(3000, clear_message)

# Function to clear the status message
def clear_message():
    status_label.config(text="Waiting for RFID input...", fg="black")

# Function to handle keyboard events
def on_key_press(key):
    global rfid_input, last_input_time
    with input_lock:
        try:
            if hasattr(key, 'char'):
                rfid_input.append(key.char)
            elif key == keyboard.Key.enter:
                rfid = ''.join(rfid_input)
                rfid_input = []
                threading.Thread(target=update_status, args=(rfid,)).start()
            current_time = time.time()
            last_input_time = current_time
        except AttributeError:
            pass

# Function to stop the service
def stop_service():
    try:
        process = subprocess.Popen(["sudo", "systemctl", "stop", "attendance_app.service"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        output, error = process.communicate()
        
        if "Password" in error:
            password = askstring("Password Required", "Enter your password:")
            process.stdin.write(password + '\n')
            process.stdin.flush()
            output, error = process.communicate()
        
        if process.returncode == 0:
            status_label.config(text="Service Stopped", fg="blue")
        else:
            status_label.config(text=f"Failed to stop service: {error}", fg="red")
    except Exception as e:
        status_label.config(text=f"Failed to stop service: {e}", fg="red")


# Set up the Tkinter UI
root = tk.Tk()
root.title("RFID Reader API Status")
root.attributes('-fullscreen', True)
root.bind('<Escape>', lambda e: root.quit())  # Pressing Escape will exit the full screen

status_label = tk.Label(root, text="Waiting for RFID input...", font=("Helvetica", 24))
status_label.pack(expand=True)

# Listener for keyboard events
listener = keyboard.Listener(on_press=on_key_press)
listener.start()

# Start the Tkinter event loop
root.mainloop()
