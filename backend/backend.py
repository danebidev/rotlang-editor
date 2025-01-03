import os
import subprocess
import tempfile
from flask import Flask, jsonify, request
import uuid

app = Flask(__name__)

def create_code_file(code):
    name = f"{uuid.uuid4()}.rl"
    path = os.path.join(tempfile.gettempdir(), name)
    
    with open(name, "w") as f:
        f.write(code)

    return path

@app.route("/api/compile", methods=["POST"])
def run_code():
    data = request.get_json()
    code = data["code"]

    source_file = create_code_file(code)
    binary_file = os.path.join(os.path.dirname(source_file), "a.out")

    try:
        compiler_proc= subprocess.run(
            [os.path.expanduser("~/bin/rotlang"), source_file],
            capture_output = True,
            text = True,
        )

        if compiler_proc.returncode != 0:
            return jsonify({
                "comp_error": f"Compilation error: {compiler_proc.stderr}"
            })

        run_proc = subprocess.run(
            [binary_file],
            capture_output=True,
            text= True,
        )

        return jsonify({
            "proc_output": run_proc.stdout,
            # This is probably impossible, since my compiler 
            # just doesn't support sterr, but whatever
            "proc_error": run_proc.stderr, 
            "comp_output": compiler_proc.stdout,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=False, port=4000)
