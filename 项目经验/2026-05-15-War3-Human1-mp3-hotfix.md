# 2026-05-15 War3 Human1.mp3 崩溃热修

- 项目/路径：`D:\备份\存档文件\魔兽争霸III冰封王座1.27 高清原版等1个文件\魔兽争霸III冰封王座1.27 高清原版\Warcraft III`
- 目标：处理 War3 报错 `The file data is corrupt`，涉及 `Sound\Music\mp3Music\Human1.mp3`。
- 诊断：截图路径中 `D:\备份存档文件` 实际应为 `D:\备份\存档文件`；游戏目录存在，`Human1.mp3` 本地覆盖文件缺失；注册表 `Allow Local Files=1`，可通过本地同路径文件覆盖 MPQ 内资源。
- 修复：创建 `Sound\Music\mp3Music\Human1.mp3`，内容为 180 秒合法静音 MP3，用于绕过损坏资源；同时将 `HKCU\Software\Blizzard Entertainment\Warcraft III\Sound` 的 `music=0`、`musicvolume=0`，保留 `sfx=1`、`sfxvolume=100`。
- 验证：目标文件已创建，大小约 2.88 MB；音乐已关闭，音效未关闭。
- 风险：如果 MPQ 内还有其他资源损坏，后续仍可能在读取其他文件时崩溃；当前已优先规避已知音乐文件问题。
- 后续：空闲时建议重新解压或换一个完整 War3 1.27 客户端，或者用完整原版 MPQ 替换损坏资源包。

## 2026-05-16 复发处理

- 复发：`Errors\2026-05-15 23.59.25 Error.txt` 仍指向 `Sound\Music\mp3Music\Human1.mp3`。
- 判断：本地覆盖文件存在且可读，但第一次生成的 MP3 带 ID3/Xing 等新式头信息，可能被 War3 1.27 的老音频库判为损坏。
- 二次修复：备份旧覆盖文件为 `Human1.ffmpeg-newstyle-backup.mp3`，重新生成无 ID3 标签、无 Xing 头、恒定 128kbps、44.1kHz 双声道 MP3，文件头直接从 MP3 frame sync 开始。
- 追加防护：将同一个兼容静音 MP3 覆盖到常见背景音乐名：Human/Orc/Undead/NightElf 1-3、GlueScreenMusic、Credits、Doom。
- 验证：`ffprobe` 可识别为 MP3，目标文件大小约 2.88 MB，`Allow Local Files=1`，音乐仍关闭、音效保留。
