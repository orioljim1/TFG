#Script to export the indices of a selection into a file saved in the desktop

import bpy
import bmesh
import os
import json

# Create a JSON object
data = {
    "vertices":[]
}

def export_file_desktop(name, json_obj):
    # Get the path to the desktop directory
    desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")

    # Specify the file path to save the JSON file on the desktop
    file_path = os.path.join(desktop_path, name + ".json")

    # Open the file and save the JSON data
    with open(file_path, "w") as file:
        json.dump(json_obj, file)
    


def print(data):
    for window in bpy.context.window_manager.windows:
        screen = window.screen
        for area in screen.areas:
            if area.type == 'CONSOLE':
                override = {'window': window, 'screen': screen, 'area': area}
                bpy.ops.console.scrollback_append(override, text=str(data), type="OUTPUT")
                

bpy.app.debug = True
index = 0 # here the index you want select please change 

obj = bpy.context.object
me = obj.data
bm = bmesh.from_edit_mesh(me)
vertices_selection = []

vertices= [e for e in bm.verts]
oa = bpy.context.active_object

for vert in vertices:
    if vert.select == True:
        vertices_selection.append(vert.index)
    
bmesh.update_edit_mesh(me)


# Create a JSON object
data = {
    "vertices":vertices_selection
}
export_file_desktop("vertices", data)