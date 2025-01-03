import os
import subprocess
import tempfile
from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

MAX_EXECUTION_TIME=3

def create_code_file(code):
    name = f"{uuid.uuid4()}.rl"
    path = os.path.join(tempfile.gettempdir(), name)
    
    with open(path, "w") as f:
        f.write(code)

    return path

@app.route("/api/compile", methods=["POST"])
def run_code():
    try:
        data = request.get_json()
        code = data["code"]

        if not code:
            return jsonify({"error": "No code provided"}), 400

        source_file = create_code_file(code)
        print(source_file)
        binary_file = os.path.join(os.path.dirname(source_file), "a.out")

        try:
            compiler_proc= subprocess.run(
                [os.path.expanduser("~/bin/rotlang"), source_file],
                capture_output = True,
                text = True,
                timeout=MAX_EXECUTION_TIME
            )

            if compiler_proc.returncode != 0:
                return jsonify({
                    "error": f"Compilation error: {compiler_proc.stdout}"
                }), 400

            run_proc = subprocess.run(
                [binary_file],
                capture_output=True,
                text= True,
                timeout=MAX_EXECUTION_TIME
            )

            return jsonify({
                "proc_output": run_proc.stdout,
                # This is probably impossible, since my compiler 
                # just doesn't support sterr, but whatever
                "proc_error": run_proc.stderr, 
                "comp_output": compiler_proc.stdout,
            })
        
        except subprocess.TimeoutExpired:
            return jsonify({
                "error": f"Execution timed out (infinite loop?)"
            }), 408

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        # finally:
        #     try:
        #         os.remove(source_file)
        #         if os.path.exists(binary_file):
        #             os.remove(binary_file)
        #     except:
        #         pass

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=False, port=4000)
