import bpy
import sys
import os

def convert_blend_to_glb(input_path, output_path):
    # Limpa a cena atual
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Carrega o arquivo .blend
    try:
        bpy.ops.wm.open_mainfile(filepath=input_path)
    except Exception as e:
        print(f"Erro ao abrir arquivo: {e}")
        sys.exit(1)

    # Configurações de exportação GLB
    # Você pode ajustar parâmetros como compressão Draco aqui
    try:
        bpy.ops.export_scene.gltf(
            filepath=output_path,
            export_format='GLB',
            export_apply=True, # Aplica modificadores
            export_images='REMAIN', # Mantém texturas
            export_materials='EXPORT'
        )
        print(f"Sucesso: {output_path}")
    except Exception as e:
        print(f"Erro na exportação: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Os argumentos após '--' são passados para o script
    args = sys.argv[sys.argv.index("--") + 1:]
    if len(args) >= 2:
        convert_blend_to_glb(args[0], args[1])
    else:
        print("Uso: blender -b -P convert.py -- input.blend output.glb")
        sys.exit(1)
