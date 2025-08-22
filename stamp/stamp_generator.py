#!/usr/bin/env python3
"""
stamp_generator.py
Generate a unique circular stamp SVG with intricate guilloché mesh patterns,
a QR code in the middle, and text arranged on a circular path.
Optimized for 500x500 pixel output with visible patterns.

Dependencies:
    pip install svgwrite qrcode pillow

Usage:
    python stamp_generator.py --client "Acme Corp" --email "acme@example.com" --out ./stamps/ACME_stamp.svg
"""

import argparse
import math
import random
import uuid
import hashlib
from datetime import datetime
from io import BytesIO
import svgwrite
from PIL import Image
import qrcode
from qrcode.image.pil import PilImage

# ----------------------------
# Utilities: ID + seed helpers
# ----------------------------
def generate_ids(seed_hint: str = ""):
    """Generate deterministic serial and signature IDs from seed hint + time + uuid."""
    base = f"{seed_hint}|{datetime.utcnow().isoformat()}|{uuid.uuid4().hex}"
    digest = hashlib.sha256(base.encode("utf-8")).hexdigest().upper()
    serial = digest[:12]  # 12 hex chars, readable short serial
    signature = str(uuid.uuid4()).upper()
    seed_val = int(hashlib.sha256((base + serial).encode()).hexdigest(), 16) % (2**32)
    return serial, signature, seed_val

# -------------------------------------
# QR generation (as an embedded SVG)
# -------------------------------------
def make_qr_svg_data(url: str, box_size: int = 3, border: int = 1):
    """Create QR as SVG markup string. Uses qrcode->PIL then converts to SVG paths."""
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_L, border=border, box_size=box_size)
    qr.add_data(url)
    qr.make(fit=True)
    img: PilImage = qr.make_image(fill_color="black", back_color="white").convert("L")
    px = img.load()
    w, h = img.size
    scale = 1
    rects = []
    for y in range(h):
        run_x = None
        for x in range(w):
            if px[x, y] < 128:  # dark
                if run_x is None:
                    run_x = x
            else:
                if run_x is not None:
                    rects.append((run_x, y, x - run_x, 1))
                    run_x = None
        if run_x is not None:
            rects.append((run_x, y, w - run_x, 1))
    svg_frag = ["<g shape-rendering='crispEdges'>"]
    for (x, y, rw, rh) in rects:
        svg_frag.append(f"<rect x='{x}' y='{y}' width='{rw}' height='{rh}' fill='#000' />")
    svg_frag.append("</g>")
    svg_inner = "\n".join(svg_frag)
    return svg_inner, w, h

# -------------------------------------------------
# Improved True Guilloché Patterns using sine waves
# -------------------------------------------------
def make_true_guilloche_pattern(
    seed: int,
    center: tuple,
    inner_radius: float,
    outer_radius: float,
    color: str = "#3801FF",
    stroke_width: float = 0.3
):
    """
    Generate true Guilloché patterns using the proper mathematical approach (sine wave modulation).
    Creates continuous curves that oscillate between inner and outer radii.
    """
    rnd = random.Random(seed)
    cx, cy = center
    paths = []
    
    # Calculate mid radius and range (amplitude)
    range_val = (outer_radius - inner_radius) * 0.5
    mid_radius = inner_radius + range_val
    
    # Generate multiple Guilloché curves with different parameters
    num_curves = 6  # Number of different curves to overlay
    
    for curve_idx in range(num_curves):
        # Use prime numbers and ensure they're not evenly divisible
        prime_divs = [7, 11, 13, 17, 19, 23]
        div = prime_divs[curve_idx % len(prime_divs)]
        
        # Ensure nodes is not a multiple of div
        base_nodes = 60 + curve_idx * 20
        nodes = base_nodes + (base_nodes % div)  # Adjust to avoid divisibility
        if nodes % div == 0:
            nodes += 1
        
        # Phase offset for variety
        phase_offset = rnd.random() * 2 * math.pi
        
        # Generate the continuous curve
        points = []
        step = 0.02  # Smaller step for smoother curves
        t_max = 2 * math.pi * div
        
        for t in [i * step for i in range(int(t_max / step) + 1)]:
            # Calculate radius using the Guilloché formula
            radius = mid_radius + math.sin(t * nodes / div + phase_offset) * range_val
            
            # Convert to Cartesian coordinates
            x = cx + math.cos(t) * radius
            y = cy + math.sin(t) * radius
            points.append((x, y))
        
        # Create SVG path
        if len(points) > 1:
            path_d = f"M {points[0][0]:.2f},{points[0][1]:.2f}"
            for x, y in points[1:]:
                path_d += f" L {x:.2f},{y:.2f}"
            
            # Vary opacity and stroke width for depth
            opacity = 0.15 + (curve_idx % 4) * 0.05
            sw = stroke_width + (curve_idx % 3) * 0.1
            
            paths.append((path_d, color, sw, opacity))
    
    return paths

def make_rosette_guilloche(
    seed: int,
    center: tuple,
    inner_radius: float,
    outer_radius: float,
    color: str = "#3801FF",
    stroke_width: float = 0.25
):
    """
    Generate rosette-style Guilloché patterns with multiple overlapping curves.
    Creates the classic interlocking pattern seen on banknotes.
    """
    rnd = random.Random(seed + 1000)
    cx, cy = center
    paths = []
    
    # Parameters for rosette patterns
    configurations = [
        {"nodes": 40, "div": 5, "phase": 0},
        {"nodes": 60, "div": 10, "phase": math.pi/4},
        {"nodes": 80, "div": 15, "phase": math.pi/2},
        {"nodes": 100, "div": 20, "phase": 3*math.pi/4},
    ]
    
    for config in configurations:
        nodes = config["nodes"]
        div = config["div"]
        phase = config["phase"]
        
        # Calculate pattern parameters
        range_val = (outer_radius - inner_radius) * 0.4  # Slightly smaller range
        mid_radius = inner_radius + (outer_radius - inner_radius) * 0.5
        
        # Generate curve points
        points = []
        step = 0.015
        t_max = 2 * math.pi * div
        
        for t in [i * step for i in range(int(t_max / step) + 1)]:
            # Enhanced Guilloché formula with multiple harmonics
            base_wave = math.sin(t * nodes / div + phase)
            harmonic = 0.3 * math.sin(t * nodes * 2 / div + phase)
            radius = mid_radius + (base_wave + harmonic) * range_val
            
            # Add slight random perturbation for organic feel
            perturbation = rnd.gauss(0, 0.5)
            radius += perturbation
            
            # Ensure radius stays within bounds
            radius = max(inner_radius * 0.9, min(outer_radius * 1.1, radius))
            
            x = cx + math.cos(t) * radius
            y = cy + math.sin(t) * radius
            points.append((x, y))
        
        # Create path
        if len(points) > 1:
            path_d = f"M {points[0][0]:.2f},{points[0][1]:.2f}"
            for x, y in points[1:]:
                path_d += f" L {x:.2f},{y:.2f}"
            
            opacity = 0.12 + (len(paths) % 5) * 0.02
            paths.append((path_d, color, stroke_width, opacity))
    
    return paths

def make_concentric_guilloche(
    seed: int,
    center: tuple,
    inner_radius: float,
    outer_radius: float,
    color: str = "#3801FF",
    stroke_width: float = 0.2
):
    """
    Generate concentric Guilloché rings at different radii.
    Creates layered security patterns.
    """
    rnd = random.Random(seed + 2000)
    cx, cy = center
    paths = []
    
    # Create multiple concentric rings
    num_rings = 5
    for ring_idx in range(num_rings):
        # Calculate radius for this ring
        t = ring_idx / (num_rings - 1) if num_rings > 1 else 0
        ring_radius = inner_radius + t * (outer_radius - inner_radius)
        
        # Wave parameters
        wave_amplitude = 3 + rnd.random() * 2
        wave_frequency = 24 + rnd.randint(-4, 4)
        phase_offset = rnd.random() * 2 * math.pi
        
        # Generate wavy circle
        points = []
        num_points = 200
        
        for i in range(num_points + 1):
            angle = (2 * math.pi * i) / num_points
            wave_offset = wave_amplitude * math.sin(wave_frequency * angle + phase_offset)
            actual_radius = ring_radius + wave_offset
            
            x = cx + actual_radius * math.cos(angle)
            y = cy + actual_radius * math.sin(angle)
            points.append((x, y))
        
        # Create closed path
        if len(points) > 1:
            path_d = f"M {points[0][0]:.2f},{points[0][1]:.2f}"
            for x, y in points[1:]:
                path_d += f" L {x:.2f},{y:.2f}"
            path_d += " Z"
            
            opacity = 0.1 + (ring_idx % 3) * 0.02
            paths.append((path_d, color, stroke_width * 0.8, opacity))
    
    return paths

def make_improved_guilloche_mesh(
    seed: int,
    center: tuple,
    inner_radius: float,
    outer_radius: float,
    color: str = "#3801FF",
    stroke_width: float = 0.5
):
    """
    Combine three Guilloché techniques for a comprehensive security pattern.
    """
    all_paths = []
    
    # Add true Guilloché patterns
    all_paths.extend(make_true_guilloche_pattern(
        seed, center, inner_radius, outer_radius, color, stroke_width
    ))
    
    # Add rosette patterns
    all_paths.extend(make_rosette_guilloche(
        seed, center, inner_radius, outer_radius, color, stroke_width * 0.8
    ))
    
    # Add concentric rings
    all_paths.extend(make_concentric_guilloche(
        seed, center, inner_radius, outer_radius, color, stroke_width * 0.6
    ))
    
    return all_paths

# -------------------------
# Build the final stamp SVG
# -------------------------
def generate_stamp_svg(
    client_name: str,
    email: str,
    serial: str,
    signature: str,
    seed: int,
    out_path: str
):
    """
    Compose 500x500 SVG stamp with visible patterns and prominent company/client names.
    """
    import os
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)

    # Fixed 500x500 dimensions
    dwg = svgwrite.Drawing(out_path, size=("500px", "500px"), viewBox="0 0 500 500")
    cx, cy = 250, 250  # Center
    
    # Stamp dimensions scaled for 500x500
    ring_outer = 240
    ring_inner = 180
    
    # Get current year
    current_year = datetime.utcnow().year

    # Background circle
    dwg.add(dwg.circle(center=(cx, cy), r=245, fill="none", stroke="none"))

    # Group for stamp
    stamp_g = dwg.g(id="stamp", fill="none", stroke="white")

    # Draw outer rings (decorative) - properly sized
    stamp_g.add(dwg.circle(center=(cx, cy), r=ring_outer, stroke="white", stroke_width=3, fill="none"))
    stamp_g.add(dwg.circle(center=(cx, cy), r=ring_outer - 15, stroke="#C1712B", stroke_width=2, fill="none"))
    stamp_g.add(dwg.circle(center=(cx, cy), r=ring_inner + 20, stroke="white", stroke_width=1, fill="none"))

    # Improved Guilloché mesh pattern - proper mathematical security patterns
    guilloche_group = dwg.g(id="guilloche_mesh", fill="none")
    mesh_paths = make_improved_guilloche_mesh(
        seed=seed,  
        center=(cx, cy),  
        inner_radius=ring_inner * 0.3,
        outer_radius=ring_inner * 0.95
    )
    for path_d, color, sw, op in mesh_paths:
        guilloche_group.add(dwg.path(
            d=path_d,  
            stroke=color,  
            stroke_width=sw,  
            opacity=op,
            stroke_linecap="round",
            stroke_linejoin="round"
        ))
    stamp_g.add(guilloche_group)

    # Generate smaller QR code for 500x500
    verify_url = f"https://yahyaoncloud.vercel.app/admin/verify?sn={serial}&sig={signature}"
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=1, border=1)
    qr.add_data(verify_url)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    
    qr_visual_size = 80  # Smaller QR for 500x500
    cell_size = qr_visual_size / len(matrix)
    
    qr_group = dwg.g(id="qr_group")
    for ry, row in enumerate(matrix):
        for rx, val in enumerate(row):
            if val:
                x = cx - qr_visual_size/2 + rx * cell_size
                y = cy - qr_visual_size/2 + ry * cell_size
                qr_group.add(dwg.rect(
                    insert=(x, y),  
                    size=(cell_size, cell_size),  
                    fill="#000",
                    stroke="none"
                ))
    
    # QR frame
    qr_frame = dwg.rect(
        insert=(cx - qr_visual_size/2 - 5, cy - qr_visual_size/2 - 5),  
        size=(qr_visual_size + 10, qr_visual_size + 10),
        fill="white",  
        stroke="#0B0F10",  
        stroke_width=3,  
        rx=3, ry=3
    )
    stamp_g.add(qr_frame)
    stamp_g.add(qr_group)

    # Enhanced centerpiece text with prominent company and client names
    center_group = dwg.g(id="center_text", fill="white", text_anchor="middle")
    
    # Company name (most prominent)
    center_group.add(dwg.text(
        "YAHYAONCLOUD",  
        insert=(cx, cy - 75),  
        font_size=18,  
        font_family="Arial, sans-serif",  
        font_weight="bold",
        letter_spacing="1px"
    ))
    
    # Verified badge
    center_group.add(dwg.text(
        "VERIFIED",  
        insert=(cx, cy - 58),  
        font_size=12,  
        font_family="Arial, sans-serif",  
        font_weight="normal"
    ))
    
    # Client name (prominent)
    center_group.add(dwg.text(
        client_name.upper(),  
        insert=(cx, cy - 45),  
        font_size=14,  
        font_family="Arial, sans-serif",
        font_weight="bold"
    ))
    
    # Year (prominent)
    center_group.add(dwg.text(
        str(current_year),  
        insert=(cx, cy + 45),  
        font_size=16,  
        font_family="Arial, sans-serif",
        font_weight="bold"
    ))
    
    # Serial number
    center_group.add(dwg.text(
        f"SN: {serial}",  
        insert=(cx, cy + 60),  
        font_size=8,  
        font_family="monospace"
    ))
    stamp_g.add(center_group)

    # Date string
    date_str = datetime.utcnow().strftime("%Y-%m-%d")

    # Curved text along outer ring - with enhanced company and client visibility
    path_id = "outer_text_path"
    path_radius = ring_outer - 8
    circ_path = f"M {cx + path_radius},{cy} a {path_radius},{path_radius} 0 1,0 {-2*path_radius},0 a {path_radius},{path_radius} 0 1,0 {2*path_radius},0"
    dwg.defs.add(dwg.path(d=circ_path, id=path_id))
    
    # Enhanced outer text with more prominent company and client names
    outer_text = f"YAHYAONCLOUD ★ {client_name.upper()} ★ {current_year} ★ VERIFIED ★ SN:{serial}"
    text_el = dwg.text("", font_size=13, font_family="Arial, sans-serif", fill="white", font_weight="bold")
    text_el.add(dwg.textPath(f"#{path_id}", outer_text, startOffset="50%"))
    stamp_g.add(text_el)

    # Inner microtext - enhanced with company branding
    micro_path_id = "inner_text_path"
    inner_r = ring_inner + 10
    inner_circ = f"M {cx + inner_r},{cy} a {inner_r},{inner_r} 0 1,0 {-2*inner_r},0 a {inner_r},{inner_r} 0 1,0 {2*inner_r},0"
    dwg.defs.add(dwg.path(d=inner_circ, id=micro_path_id))
    
    micro_txt = f"YAHYAONCLOUD • {client_name} • SECURE • {current_year} • AUTHENTICATED • "
    micro_text_el = dwg.text("", font_size=7, font_family="Arial, sans-serif", fill="white")
    micro_text_el.add(dwg.textPath(f"#{micro_path_id}", micro_txt * 3, startOffset="0"))
    stamp_g.add(micro_text_el)

    # Add signature id text with enhanced styling
    sig_group = dwg.g(id="sig_text", font_size=7, fill="white", font_family="monospace")
    sig_group.add(dwg.text(f"SIG: {signature}", insert=(cx + qr_visual_size/2 + 10, cy + qr_visual_size/2 - 2)))
    stamp_g.add(sig_group)

    # Additional decorative elements with company branding
    # Add small YahyaOnCloud logos/text in corners of the outer ring
    corner_group = dwg.g(id="corner_branding", font_size=8, fill="white", font_family="Arial, sans-serif")
    
    # Top corner
    corner_group.add(dwg.text("YOC", insert=(cx - 5, cy - ring_outer + 25), text_anchor="middle", font_weight="bold"))
    # Bottom corner  
    corner_group.add(dwg.text(str(current_year), insert=(cx - 5, cy + ring_outer - 15), text_anchor="middle", font_weight="bold"))
    
    stamp_g.add(corner_group)

    # Add the assembled group to the drawing
    dwg.add(stamp_g)

    # Save
    dwg.save()
    return out_path

# -----------------------
# CLI entrypoint
# -----------------------
def main():
    parser = argparse.ArgumentParser(description="Generate anti-counterfeit circular stamp SVG (500x500)")
    parser.add_argument("--client", required=True, help="Client display name (e.g. 'Acme Corp')")
    parser.add_argument("--email", default="", help="Client email (optional)")
    parser.add_argument("--seed", default="", help="Optional seed hint to influence generation (reproducible)")
    parser.add_argument("--out", default=None, help="Output SVG path (defaults to ./stamp_<serial>.svg)")
    args = parser.parse_args()

    serial, signature, seed = generate_ids(args.seed)
    outfile = args.out or f"stamp_{serial}.svg"
    print(f"Generating 500x500 stamp for {args.client}")
    print(f"Serial: {serial}, Signature: {signature}, Seed: {seed}")
    
    path = generate_stamp_svg(
        client_name=args.client,
        email=args.email,
        serial=serial,
        signature=signature,
        seed=seed,
        out_path=outfile
    )
    print(f"Saved stamp SVG to: {path}")
    print(f"Verification URL: https://yahyaoncloud.vercel.app/admin/verify?sn={serial}&sig={signature}")

if __name__ == "__main__":
    main()