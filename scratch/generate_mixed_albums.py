import os
import json
import random

folders = {
    '1': 'album1',
    '2': 'album2',
    '3': 'album3',
    'видосики': 'videos',
    'с братаном': 'bro',
    'угарные': 'funny'
}

photos = []
videos = []

for folder, album_key in folders.items():
    p = os.path.join('ФОТО', folder)
    if not os.path.exists(p):
        continue
    for f in sorted(os.listdir(p)):
        if f.startswith('.'):
            continue
        ext = os.path.splitext(f)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.webp']:
            if f.endswith('_thumb.jpg'):
                continue
            full_p = os.path.join(p, f)
            if not os.path.isfile(full_p):
                continue
            photos.append({
                'type': 'photo',
                'folder': folder,
                'album': album_key,
                'path': f'ФОТО/{folder}/{f}',
                'thumb': f'ФОТО/{folder}/{f}',
                'title': f'Момент ({folder})'
            })
        elif ext in ['.mov', '.avi']:
            base = os.path.splitext(f)[0]
            mp4_file = f'{base}.mp4'
            thumb_file = f'{base}_thumb.jpg'
            videos.append({
                'type': 'video',
                'folder': folder,
                'album': album_key,
                'path': f'ФОТО/{folder}/{mp4_file}',
                'thumb': f'ФОТО/{folder}/{thumb_file}',
                'title': f'Видео ({base})'
            })

print(f'Photos: {len(photos)}, Videos: {len(videos)}')

# Thorough random shuffle
rng = random.Random(20260927)
rng.shuffle(photos)
rng.shuffle(videos)

# Disperse videos across the album
segments = [(8, 18), (26, 38), (46, 58), (66, 78), (86, 98), (105, 118)]
all_items = list(photos)
for v, (lo, hi) in zip(videos, segments):
    pos = rng.randint(lo, min(hi, len(all_items)))
    all_items.insert(pos, v)

# Add id to each
for idx, it in enumerate(all_items):
    it['id'] = idx + 1

print(f'Final all_items count: {len(all_items)}')
video_indices = [i for i, x in enumerate(all_items) if x['type'] == 'video']
print(f'Video indices: {video_indices}')

# Verify all paths exist
for it in all_items:
    if not os.path.exists(it['path']):
        raise FileNotFoundError(f'Missing path: {it["path"]}')
    if not os.path.exists(it['thumb']):
        raise FileNotFoundError(f'Missing thumb: {it["thumb"]}')

# Write js/albums_data.js
js_content = 'const albumsData = {\n    allPhotos: [\n'
for it in all_items:
    js_content += f'        {json.dumps(it, ensure_ascii=False)},\n'
js_content += '    ]\n};\n\nwindow.albumsData = albumsData;\n'

with open('js/albums_data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print('js/albums_data.js written successfully!')
