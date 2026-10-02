"""Validate the delivered encoder output, including picture/audio clock alignment."""
from pathlib import Path
import hashlib
import json
import subprocess
import numpy as np
from scipy import signal
import soundfile as sf
import pyloudnorm as pyln

ROOT = Path(__file__).resolve().parent
VIDEO = ROOT / 'out/repetition/fkr-price-of-repetition-1080p60.mp4'
OUT = VIDEO.parent / 'qa'
OUT.mkdir(exist_ok=True)
probe = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-show_format',
    '-of', 'json', str(VIDEO)]))
(OUT / 'mp4-probe.json').write_text(json.dumps(probe, ensure_ascii=False, indent=2))
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
assert (v['width'], v['height'], v['r_frame_rate'], int(v['nb_read_frames'])) == (1920,1080,'60/1',3600)
assert (a['codec_name'], int(a['sample_rate']), a['channels']) == ('aac',48000,2)
assert v['pix_fmt'] == 'yuv420p'
assert abs(float(v['duration']) - 60) < 1/60
assert abs(float(a['duration']) - 60) < .025
decoded = OUT / 'mp4-decoded-audio.wav'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(VIDEO),'-vn','-c:a','pcm_f32le',str(decoded)],check=True)
x, sr = sf.read(decoded)
source, _ = sf.read(ROOT / 'public/audio/repetition/soundtrack.wav')
x = x[:len(source)]
assert np.isfinite(x).all()
# The transient-rich section gives an unambiguous encoder alignment estimate.
start, end = 24*sr, 28*sr
corr = signal.correlate(x[start:end].mean(1),source[start:end].mean(1),method='fft',mode='full')
lag = int(np.argmax(corr) - (end-start-1))
assert abs(lag) <= 1, f'A/V soundtrack shift: {lag} samples'
truepeak = float(np.max(np.abs(signal.resample_poly(x,4,1))))
silence = x[round((1428/60+.03)*sr):round((1440/60-.03)*sr)]
report = {
    'video':str(VIDEO),'duration_seconds':float(v['duration']),
    'size_bytes':VIDEO.stat().st_size,'frames':int(v['nb_read_frames']),
    'resolution':[1920,1080],'fps':60,'pixel_format':v['pix_fmt'],
    'audio_codec':a['codec_name'],'audio_sample_rate':sr,'audio_channels':2,
    'audio_integrated_lufs':float(pyln.Meter(sr).integrated_loudness(x)),
    'audio_true_peak_dbfs_4x':float(20*np.log10(truepeak)),
    'soundtrack_alignment_error_samples':lag,
    'soundtrack_correlation':float(np.corrcoef(x.flatten(),source.flatten())[0,1]),
    'pre_drop_pause_interior_peak_dbfs':float(20*np.log10(max(np.abs(silence).max(),1e-15))),
    'clipped_audio_samples':int(np.sum(np.abs(x)>=1)),
    'sha256':hashlib.sha256(VIDEO.read_bytes()).hexdigest(),
    'scope':'Encoder, frame count, waveform, codec, alignment, loudness and decode validation; visual inspection recorded separately.',
}
assert report['clipped_audio_samples']==0
assert report['audio_true_peak_dbfs_4x'] < -1
assert report['soundtrack_correlation'] > .99
assert report['pre_drop_pause_interior_peak_dbfs'] < -80
subprocess.run(['ffmpeg','-v','error','-i',str(VIDEO),'-f','null','-'],check=True)
report['complete_file_decodes_without_error'] = True
(OUT / 'delivery-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
