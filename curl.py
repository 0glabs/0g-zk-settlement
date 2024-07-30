import json
import subprocess
import sys
import time

def read_json_file(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def build_curl_command(data, url):
    curl_command = [
        'curl',
        '-X', 'POST',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps(data),
        url
    ]
    return curl_command

def execute_curl(command, output_file):
    start_time = time.time()
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        with open(output_file, 'w') as file:
            file.write(result.stdout)
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Command executed successfully. Output saved to {output_file}")
        print(f"Execution time: {execution_time:.2f} seconds")
    except subprocess.CalledProcessError as e:
        end_time = time.time()
        execution_time = end_time - start_time
        print(f"Error executing curl command: {e}")
        print(f"Error output: {e.stderr}")
        print(f"Execution time: {execution_time:.2f} seconds")

def main():
    if len(sys.argv) != 4:
        print("Usage: python script.py <input_json_file> <output_file> <url>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    url = sys.argv[3]

    start_time = time.time()
    try:
        data = read_json_file(input_file)
        curl_command = build_curl_command(data, url)
        execute_curl(curl_command, output_file)
    except json.JSONDecodeError:
        print(f"Error: {input_file} is not a valid JSON file.")
    except FileNotFoundError:
        print(f"Error: File {input_file} not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        end_time = time.time()
        total_time = end_time - start_time
        print(f"Total script execution time: {total_time:.2f} seconds")

if __name__ == "__main__":
    main()