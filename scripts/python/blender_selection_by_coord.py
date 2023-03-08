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


obj = bpy.context.object
me = obj.data
bm = bmesh.from_edit_mesh(me)

vertices= [e for e in bm.verts]
verts_coord = [vert.co for vert in bm.verts]
plain_verts = [vert.to_tuple() for vert in verts_coord]

oa = bpy.context.active_object

print(verts_coord[0])

for vert in vertices:
    if plain_verts[vert.index][2] >= 1.55:
        vert.select = True
    else:
        vert.select = False

bmesh.update_edit_mesh(me)