#show heading.where(
  level: 1
): set text(size: 20pt, fill: rgb("#4A77AE"))

#show heading.where(
  level: 2
): set text(fill: rgb("#4A77AE"))




#show link: set text(rgb("#4A77AE"))

#set page(
  margin: (x: 0.9cm, y: 1.8cm),
)

#set par(justify: true)

#let chiline() = {v(-3pt); line(length: 100%); v(-3pt)}



#set align(center)
= Jianhao Zeng

#v(6pt)
jh_zeng\@tju.edu.cn | #link("https://zengjianhao.github.io")[zengjianhao.github.io] | #link("https://scholar.google.com.hk/citations?user=Sh4tLFsAAAAJ&hl=zh-CN")[Google Scholar]
#v(6pt)

#set align(left)

== Education
#chiline()

#text(size:12pt)[*Tianjin University* #h(1fr) Tianjin, China] \
#text(size:12pt)[M.S. in Electronic and Information Engineering #h(1fr) 2021/09 -- 2024/06] \
#text(size:12pt)[Advisor: Prof. #link("https://seea.tju.edu.cn/info/1014/1460.htm")[Dan Song]]

#text(size:12pt)[*Tianjin University* #h(1fr) Tianjin, China] \
#text(size:12pt)[B.Eng. in Mechanical Design & Manufacturing and Their Automation #h(1fr) 2017/09 -- 2021/06] \

== Research Interests
#chiline()

#text(size:12pt)[I am broadly interested in computer vision and multi-modal learning, especially generative models and their application, including video generation, image generation and 3D content generation. I have extensively explored 2D virtual try-on and text-to-video generation. Additionally, automatic 3D content generation is crucial for building virtual worlds, so I am also interested in high-quality 3D content generation.]

== Publications and Manuscripts
#chiline()

#set enum(numbering: n => "["+"P."+[#n]+"]")
1. #h(4pt)#text(size:10pt)[#link("https://ieeexplore.ieee.org/document/10336823")[*Fashion Customization: Image Generation Based on Editing Clue*]] <P1>
#v(-6pt)
#h(30pt) #text(size:10pt)[Dan Song, #underline()[*Jianhao Zeng*], Min Liu, Xuanya Li, Anan Liu#super[\#]]
#v(-6pt)
#h(30pt) #text(size:10pt)[#emph()[IEEE Transactions on Circuits and Systems for Video Technology (TCSVT)]]


2. #h(4pt) #text(size:10pt)[ #link("https://arxiv.org/abs/2311.18405")[*CAT-DM: Controllable Accelerated Virtual Try-on with Diffusion Model*]] <P2>
#v(-6pt)
#h(30pt) #text(size:10pt)[#underline()[*Jianhao Zeng*], Dan Song#super[\#], Weizhi Nie, Hongshuo Tian, Tongtong Wang, Anan Liu#super[\#]]
#v(-6pt)
#h(30pt) #text(size:10pt)[#emph()[IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2024)]]


#set enum(numbering: n => "["+"M."+[#n]+"]")
1. #text(size:10pt)[#link("https://arxiv.org/abs/2403.08453")[*Better Fit: Accommodate Variations in Clothing Types for Virtual Try-on*]] <M1>
#v(-6pt)
#h(30pt) #text(size:10pt)[Dan Song, Xuanpu Zhang, #underline()[*Jianhao Zeng*], Pengxin Zhan, Qingguo Chen, Weihua Luo, Anan Liu#super[\#]]
#v(-6pt)
#h(30pt) #text(size:10pt)[#emph()[IEEE Transactions on Circuits and Systems for Video Technology (TCSVT) Major reversion]]


// 2. #text(size:10pt)[#link("https://arxiv.org/abs/2411.18162")[*SentiXRL: An advanced large language Model Framework for Multilingual Fine-Grained Emotion Classification in Complex Text Environment*]] <M2>
// #v(-6pt)
// #h(30pt) #text(size:10pt)[Jie Wang, Yichen Wang, Zhilin Zhang, #underline()[*Jianhao Zeng*], Kaidi Wang, Zhiyang Chen#super[\#]]
// #v(-6pt)
// #h(30pt) #text(size:10pt)[#emph()[The 31st International Conference on Computational Linguistics (COLING 2025) In submission]]



2. #text(size:10pt)[#link("https://arxiv.org/abs/2408.06047")[*BooW-VTON: Boosting In-the-Wild Virtual Try-On via Mask-Free Pseudo Data Training*]] <M2>
#v(-6pt)
#h(30pt) #text(size:10pt)[Xuanpu Zhang, Dan Song, Pengxin Zhan, Tianyu Chang, #underline()[*Jianhao Zeng*], Qingguo Chen, Weihua Luo, Anan Liu#super[\#]]
#v(-6pt)
#h(30pt) #text(size:10pt)[#emph()[IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2025) In submission]]

3. #text(size:10pt)[*Robust-MVTON: Learning Cross-Pose Feature Alignment and Fusion for Robust Multi-View Virtual Try-On*] <M3>
#v(-6pt)
#h(30pt) #text(size:10pt)[Nannan Zhang, Yijiang Li, Dong Du, Zheng Chong, Zhengwentai Sun, #underline()[*Jianhao Zeng*], Yusheng Dai, Zhenyu Xie, Hairui Zhu, Xiaoguang Han#super[\#]]
#v(-6pt)
#h(30pt) #text(size:10pt)[#emph()[IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2025) In submission]]


4. #text(size:10pt)[*FocusDiT: Masking Queries in Diffusion Transformers for Fine-grained Image Generation*] <M4>
#v(-6pt)
#h(30pt) #text(size:10pt)[Xueji Fang, #underline()[*Jianhao Zeng*], Zeyu Wu, Mingyuan Zhou, Liyuan Ma, Guojun Qi#super[\#]]
#v(-6pt)
#h(30pt) #text(size:10pt)[#emph()[IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2025) In submission]]



== Research Experiences
#chiline()

*Laboratory for MAchine Perception and LEarning (MAPLE), Westlake University* #h(1fr) Hangzhou, China \
Research Assistant #h(1fr) 2024/06 -- Current\
Advisor: Dr. #link("https://scholar.google.com/citations?user=j6T8Tk8AAAAJ&hl=zh-CN")[Liyuan Ma], Dr. #link("https://volgachen.github.io/")[Zhiyang Chen] and Prof. #link("http://maple-lab.net/gqi/")[Guojun Qi] (Fellow of IEEE, IAPR and AAIA) \
- A text-to-image generation model called FocusDiT. It applies a Masking scheme to focus on critical query tokens that are exclusively fed into FFN, which were submitted to CVPR 2025. #link(<M4>)[\[M.4\]]
- The video generation model SnapVideo has been successfully replicated.


*Institute of Television and Image Information, Tianjin University* #h(1fr) Tianjin, China \
Graduate Student #h(1fr) 2021/09 -- 2024/06 \
Advisor: Prof. #link("https://seea.tju.edu.cn/info/1014/1460.htm")[Dan Song] and Prof. #link("https://seea.tju.edu.cn/info/1014/1508.htm")[Anan Liu]
- A novel framework for generating customized fashion images. This framework enables users to create tailored fashion visuals by providing multi-modal editing clues, which were accepted to TCSVT. #link(<P1>)[\[P.1\]]
- A model called CAT-DM based on ControNet and PBE for virtual try-on. This model utilizes the implicit distribution generated by a pre-trained GAN-based model to initiate the reverse denoising process. CAT-DM not only retains the pattern and texture details of the in-shop garment but also reduces the sampling steps without compromising generation quality, which were accepted to CVPR 2024. #link(<P2>)[\[P.2\]]
- An adaptive mask training paradigm that dynamically adjusts training masks for virtual try-on. It not only improves the alignment and fit of clothing but also significantly enhances the fidelity of virtual try on experience, which were submitted to TCSVT. #link(<M1>)[\[M.1\]]
- A mask-free virtual try-on diffusion model called BooW-VTON. It generates realistic try-on results without requiring any additional parser, which were submitted to CVPR 2025. #link(<M3>)[\[M.2\]]
- A Multi-View Try-On method called Robust-MVTON. It generates robust and high-quality multi-view ry-on results using front- and back-view clothing inputs, which were submitted to CVPR 2025. #link(<M4>)[\[M.3\]]





== Competitions
#chiline()

- *Top 6.9%* in Jiangsu Meteorological AI Algorithm Challenge #h(4fr) 2022/06 \
- *First Prize* in Tianjin University Undergraduate Physicists Tournament (TJUPT) #h(4fr) 2019/08 \
- *Second Prize* in National College Students Mathematical Competition #h(4fr) 2018/10 \
- *Third Prize* in Tianjin College Student Mathematics Competition #h(4fr) 2018/05 \

== Awards
#chiline()

- *CVPR Registration and Travel Support* #h(1fr) 2024 \
- *Excellent Master's Degree Thesis of Tianjin University* (Top 5%) #h(1fr) 2024 \
- *Tianjin University Academic Scholarship* #h(1fr) 2021, 2022, 2023 \


== Others
#chiline()

- *Reviewer*: ACM MM (2024), ICLR (2025), CVPR (2025)
- *Teaching Assistant*: Digital Logic Circuit, Tianjin University
- *Translation*: Physically Based Rendering: From Theory To Implementation, fourth edition
- *Patent*: A Fashion Image Editing Method and Device Based on Self-Attention Mechanism (CN115082295B)


== Skills
#chiline()

- *Programming Languages* #h(1fr) C, C++, Python, HTML, CSS, JavaScript \
- *Frameworks* #h(1fr) PyTorch, PyTorch Lightning, Accelerate \
- *Tools* #h(1fr) Linux, Git, LaTeX, Typst \
- *Human Languages* #h(1fr) Mandarin, English (TOEFL iBT: 94)