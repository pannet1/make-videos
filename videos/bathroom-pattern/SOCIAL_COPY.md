# Multi-Platform Social Media & Syndication Copy

Pre-formatted copy-paste text for promoting the **ApartmentThread Bathroom Pattern (BA-01)** explainer video across YouTube Community, Twitter/X, LinkedIn, and Reddit.

---

## 1. YouTube Community Post

**Recommended Image:** `01-thumbnail-1920x1080.png` or `scene-stills/scene-01-problem.png`

**Post Copy:**
```text
Why do smart bathrooms fail?

Traditional PIR motion sensors cannot see through glass shower cabins, and 24GHz mmWave radar suffers from reflection noise off glazed tiles and water droplet vibrations. Even worse, naive rules like "door closed = ON" leave you stepping into pitch darkness.

In our new explainer video, we break down the Apartment Thread Bathroom Pattern (BA-01):
⚡ Physical Boundary Determinism using a ₹57 passive MC-38 magnetic reed switch
⚡ Exterior frame mounting completely isolated from shower steam and condensation
⚡ In-wall switchboard "dummy channel" wiring into switch input S2 of a Tinxy module
⚡ Sub-5ms closed-loop state machine running directly on local silicon
⚡ 100% local-first: zero cloud, zero hub dependency, and full mechanical switch override

Watch the full engineering breakdown with circuit schematics and logic analyzer traces:
[INSERT YOUTUBE VIDEO LINK HERE]

Full open-source documentation:
https://github.com/pannet1/ApartmentThread
```

---

## 2. Twitter / X Technical Thread (5-Tweet Breakdown)

### Tweet 1 (Hook + Problem)
**Attachment:** `scene-stills/scene-01-problem.png`
```text
Why do smart bathrooms fail?

PIR motion sensors can't see through glass shower cabins, and 24GHz mmWave radar scatters off glazed ceramic tiles.

Here is how we solved bathroom presence in standard Indian modular switchboards for under ₹60 without cloud or batteries 🧵👇
```

### Tweet 2 (Physical Boundary Determinism)
**Attachment:** `scene-stills/scene-02-sensor.png`
```text
2/ Instead of fighting steam inside the shower, we exploit the bathroom door as an absolute physical boundary.

A ₹57 MC-38 magnetic reed switch mounts on the exterior door jamb—completely isolated from condensation.

When the door gap is <15mm, the hermetic rhodium contact closes reliably.
```

### Tweet 3 (The In-Wall Dummy Channel)
**Attachment:** `scene-stills/scene-03-wiring.png`
```text
3/ In Indian apartments, the switchboard is adjacent to the door frame.

We pull a thin 2-core wire into switch input S2 of an in-wall Tinxy module.

Leaving Relay 2 unconnected as a "dummy channel" triggers a hardware GPIO interrupt in <3.8ms on ESP8266 silicon with zero latency.
```

### Tweet 4 (The Sub-5ms State Machine)
**Attachment:** `scene-stills/scene-04-state-machine.png`
```text
4/ A 4-state engine runs directly on chip:
• State 1: Door opens → Light ON instantly (<5ms) before entry
• State 2: Door closes → Vanity & exhaust latch ON (immune to stillness)
• State 3: Door opens on exit → 60s dissipation grace timer begins
• State 4: Timer expires → Auto shut-off
```

### Tweet 5 (100% Local-First & GitHub)
**Attachment:** `scene-stills/scene-05-local-first.png`
```text
5/ 100% Local-First:

Even if Wi-Fi, Thread, or Home Assistant goes offline, the switchboard operates autonomously. Physical rocker switches retain complete mechanical override.

Full video walkthrough: [INSERT YOUTUBE VIDEO LINK]
Open-source blueprints: https://github.com/pannet1/ApartmentThread
```

---

## 3. LinkedIn Engineering Article / Update

**Recommended Image:** `01-thumbnail-1920x1080.png`

**Post Copy:**
```text
Solving the "Smart Bathroom" Edge-Case with Physical Boundary Determinism and Local-First Silicon

In residential IoT design, bathrooms present one of the most hostile sensor environments:
1. Passive Infrared (PIR) radiation (10µm FIR) is blocked by glass shower stalls.
2. 24GHz microwave radar suffers from severe multipath reflections off glazed ceramic tiles and water droplet micro-vibrations.
3. High relative humidity and condensation degrade battery-powered wireless transceivers.

In the Apartment Thread project, we approached this by identifying the bathroom door as an absolute physical boundary rather than deploying complex sensor arrays.

Key Architectural Takeaways:
• Deterministic Boundary: A passive MC-38 magnetic reed switch mounted on the exterior door frame stays completely isolated from steam and condensation.
• In-Wall Dummy Channel: Routing dry-contact sensor wiring directly into an unused input (S2) of an adjacent in-wall Tinxy module decouples the relay and executes a GPIO interrupt in under 3.8ms.
• Local-First State Machine: A 4-state presence loop (Entry trigger, Occupied latch, Exit grace period, Vacated shut-off) executes locally on ESP8266 silicon. If Home Assistant or the home Wi-Fi network goes offline, the bathroom automates seamlessly with zero degradation.
• Mechanical Fail-Safe: Traditional physical rocker switches maintain manual override at all times.

Watch the complete 16:9 explainer video with animated circuit cutaways and logic analyzer traces:
[INSERT YOUTUBE VIDEO LINK HERE]

Repository & full hardware pinouts:
https://github.com/pannet1/ApartmentThread

#HomeAutomation #LocalFirst #EmbeddedSystems #IoT #SmartHome #ESP8266 #HomeAssistant
```

---

## 4. Reddit Post (r/homeassistant & r/esp8266)

**Title:** How to reliably automate bathroom lighting without motion sensors or cloud hubs (The In-Wall Dummy Channel Technique)

**Post Body:**
```markdown
Like many in the community, I've struggled with smart bathroom automations:
- PIR sensors can't see through glass shower doors.
- mmWave radar (LD2410/etc.) detects water droplet vibration on tiles and causes false triggers or gets stuck.
- Battery-powered Zigbee/BLE door sensors often suffer from latency (>500ms) or die quickly in high humidity.
- Naive "door closed = lights on" rules mean you step into pitch darkness before closing the door.

For **Apartment Thread** (an open-source local-first smart home deployment for Indian modular switchboards), we built a 100% deterministic, shower-proof solution for under ₹60 INR (~$0.70 USD):

### 1. Physical Boundary Determinism
Every bathroom has a door. Instead of placing active sensors inside the wet zone, we mount a passive **MC-38 magnetic reed switch** on the exterior door jamb. The dry-contact reed capsule remains completely isolated from hot shower steam, soap residue, and condensation.

### 2. The In-Wall "Dummy Channel"
In standard apartment wiring, the room modular switchboard sits directly next to the bathroom door frame. We run a 2-core wire through conduit straight into input `S2` of an in-wall smart switch module (Tinxy 4+1 with ESP8266). By decoupling Relay 2 in firmware, `S2` functions as an isolated dry-contact input triggering a hardware GPIO interrupt in <3.8ms.

### 3. Sub-5ms Silicon State Machine
The logic runs locally on the switchboard's chip (ESPHome / Tasmota):
- **State 1 (Entry):** Opening the door from outside with the lights off immediately turns the light ON (<5ms) before you step over the threshold, starting a 60s entry timer.
- **State 2 (Occupied Latch):** Pulling the door shut latches occupancy: vanity light and exhaust fan stay locked ON indefinitely. You can stand completely motionless in the shower for an hour, and lights will never turn off.
- **State 3 (Exit Grace Period):** Opening the door to leave starts a 60-second vacancy countdown and ventilation cycle.
- **State 4 (Vacated):** Once the timer expires, the lights shut off automatically.

### 4. 100% Local-First & Zero Hub Dependency
If Home Assistant restarts, the Wi-Fi drops, or the Thread mesh goes down, the bathroom lighting operates identically on edge silicon. The physical wall switches retain manual mechanical rocker override at all times.

Full 16:9 explainer video with circuit schematics and logic analyzer waveforms:
[INSERT YOUTUBE VIDEO LINK HERE]

GitHub repo with wiring schematics & ESPHome deployment YAML:
https://github.com/pannet1/ApartmentThread
```
