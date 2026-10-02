# Звуки из Soundsnap → слоты ролика

Положите скачанный файл в эту папку **под именем слота** (wav/mp3/aif/ogg), затем пересоберите звук и видео:

```bash
.venv/bin/python audio/build_audio.py && npx remotion render Promo out/fkr-promo.mp4 --codec h264 --crf 16
```

Если файла нет — используется синтезированный слой. Время — секунда ролика, куда ляжет звук (начало файла = момент удара, поэтому берите звуки без тишины в начале).

| Слот | Что искать на Soundsnap | Где в ролике |
|---|---|---|
| `hit_main` | Trailer hits → «cinematic impact boom sub» (длинный хвост) | 0:16 — вспышка, появление логотипа |
| `braam_drop` | Trailer hits → «braam» / «low brass hit» | 0:20 — дроп, появляется система |
| `hit_small` | Trailer hits → «impact short punchy» | 0:00–0:08 — цифры 3 000 / 12 000 / ×3 / ≈20 |
| `braam` | «dark braam tension» | 0:12 — «Общей картины нет ни у кого» |
| `riser_long` | Cinematic transitions → «riser tension 4 sec» | 0:12–0:16 |
| `riser_short` | «riser short whoosh up» (~1 с) | 0:19–0:20 перед дропом |
| `whip` | Cinematic transitions → «whip pan fast» | 0:45.7 — переход к ТМЦ |
| `whoosh_1`, `whoosh_2`, `whoosh_3` | Cinematic transitions → «soft air whoosh» (0.6–1 с, 3 разных) | все движения камеры |
| `hit_stamp` | «stamp heavy» / «impact thud paper» | 1:00.3 — печать электронной подписи |
| `hit_final` | Trailer hits → «cinematic logo hit» | 1:08.4 — финальный логотип |
| `ui_click` | User interface → «click soft modern» | все клики курсора |
| `ui_alert` | User interface → «error alert soft» | 0:48.5 — превышение сметы |

Лицензия Soundsnap разрешает коммерческое использование в видео для платных подписчиков; перепродавать сами звуки нельзя.
