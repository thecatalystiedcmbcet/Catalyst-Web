import json
from collections import defaultdict
import sys

file_path = 'Trace-20260613T224522.json'

print("Loading trace...")
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
except Exception as e:
    print(f"Error loading JSON: {e}")
    sys.exit(1)

print("Parsing events...")
events = data.get('traceEvents', data) if isinstance(data, dict) else data

long_tasks = []
function_durations = defaultdict(int)
event_names = defaultdict(int)
urls_time = defaultdict(int)

for ev in events:
    if 'dur' in ev and isinstance(ev['dur'], (int, float)):
        name = ev.get('name', 'Unknown')
        dur = ev['dur']
        event_names[name] += dur
        
        if name in ['EvaluateScript', 'FunctionCall', 'MinorGC', 'MajorGC', 'Layout', 'UpdateLayerTree', 'Paint', 'CompositeLayers', 'CompileScript']:
            long_tasks.append(ev)
        
        args = ev.get('args', {})
        data_arg = args.get('data', {})
        
        if name == 'FunctionCall':
            func_name = data_arg.get('functionName', 'anonymous')
            url = data_arg.get('url', 'unknown')
            key = f"{func_name} @ {url}"
            function_durations[key] += dur
            
        if name in ['EvaluateScript', 'CompileScript']:
            url = data_arg.get('url', 'unknown')
            if url:
                urls_time[url] += dur

long_tasks.sort(key=lambda x: x.get('dur', 0), reverse=True)

print("\n--- TOP 10 LONGEST INDIVIDUAL EVENTS ---")
for task in long_tasks[:10]:
    print(f"Name: {task.get('name')}, Duration: {task.get('dur') / 1000.0:.2f}ms")

print("\n--- TOP 10 EVENT CATEGORIES (TOTAL TIME) ---")
for name, dur in sorted(event_names.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f"Name: {name}, Total Duration: {dur / 1000.0:.2f}ms")

print("\n--- TOP 10 MOST EXPENSIVE JS FUNCTIONS (TOTAL TIME) ---")
for name, dur in sorted(function_durations.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f"Function: {name}, Total Duration: {dur / 1000.0:.2f}ms")

print("\n--- TOP 10 MOST EXPENSIVE SCRIPTS (COMPILE/EVALUATE TOTAL TIME) ---")
for name, dur in sorted(urls_time.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f"URL: {name}, Total Duration: {dur / 1000.0:.2f}ms")
