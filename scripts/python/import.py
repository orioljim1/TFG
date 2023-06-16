#Script to import the indices of a selection from a json file saved in the desktop

import bpy
import bmesh
import os
import json

def print(data):
    for window in bpy.context.window_manager.windows:
        screen = window.screen
        for area in screen.areas:
            if area.type == 'CONSOLE':
                override = {'window': window, 'screen': screen, 'area': area}
                bpy.ops.console.scrollback_append(override, text=str(data), type="OUTPUT")

# Get the path to the desktop directory
desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")

# Specify the file path of the JSON file on the desktop
file_path = os.path.join(desktop_path, "vertices_white.json")

# Load the JSON file into a dictionary
with open(file_path, "r") as file:
    json_data = json.load(file)

# Print the dictionary
vertices_selection = json_data['vertices']

index = 0 # here the index you want select please change 

obj = bpy.context.object
me = obj.data
bm = bmesh.from_edit_mesh(me)

vertices= [e for e in bm.verts]
oa = bpy.context.active_object

for vert in vertices:
    if vert.index in vertices_selection:
        vert.select = True
    else:
        vert.select = False

bmesh.update_edit_mesh(me)

