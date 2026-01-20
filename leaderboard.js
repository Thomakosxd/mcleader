document.addEventListener('DOMContentLoaded', () => {

    /* ================================
       1. ΡΥΘΜΙΣΕΙΣ ΠΟΝΤΩΝ & TIERLIST IDS
    ================================= */
    const points = [5, 3, 2];
    const defaultPoint = 1;
  
    const tierlistsIds = [
        'maceTier', 'swordTier', 'axeTier', 'smpTier',
        'potTier', 'nethPot', 'vanillaTier', 'uhcTier'
    ];
  
    /* ================================
       2. PLAYER STYLES
    ================================= */
    const playerStyle = {
        "Leo":     { color: "lime",   emoji: "🥝" },
        "Thomas":  { color: "cyan", emoji: "🖥️" },
        "Nikas":   { color: "red",   emoji: "🛡️" },
        "Aggelos": { color: "violet", emoji: "🪓" },
        "Nikos":   { color: "gray",    emoji: "🔥" },
        "Stamos":  { color: "yellow", emoji: "💎" }
    };
  
    /* ================================
       3. ΥΠΟΛΟΓΙΣΜΟΣ ΠΟΝΤΩΝ
    ================================= */
    const scores = {};
  
    tierlistsIds.forEach(id => {
        const ul = document.getElementById(id);
        if (!ul) return;
  
        const items = ul.querySelectorAll('li');
        items.forEach((li, index) => {
            const player = li.firstChild.textContent.trim();
            if (!player) return;
  
            const point = index < points.length ? points[index] : defaultPoint;
            scores[player] = (scores[player] || 0) + point;
  
            const style = playerStyle[player];
            if (style) {
                li.style.color = style.color;
                li.dataset.emoji = style.emoji;
            }
        });
    });
  
    /* ================================
       4. API SETTINGS & DATA FETCH
    ================================= */
    const PROXY_URL = "https://mctiers.thomasts1801.workers.dev";
    const modeMap = {
        mace: "maceTier", sword: "swordTier", axe: "axeTier",
        smp: "smpTier", pot: 'potTier', nethop: "nethPot",
        endcrystal: "vanillaTier", uhc: "uhcTier"
    };
    const POS_MAP = { 0: "HT", 1: "LT" };

    const tooltip = document.createElement('div');
    tooltip.className = 'player-tooltip';
    document.body.appendChild(tooltip);

    let allPlayersData = [];

    fetch('players.json')
        .then(res => res.json())
        .then(async players => {
            allPlayersData = players;

            // 5. API RANKS FETCH
            for (const player of players) {
                if (!player.uuid) continue;
                try {
                    const res = await fetch(`${PROXY_URL}?uuid=${player.uuid}`);
                    const apiData = await res.json();
                    player.ranks = {};
                    Object.keys(modeMap).forEach(modeKey => {
                        const apiMode = apiData[modeKey];
                        const jsonKey = modeMap[modeKey];
                        if (apiMode && apiMode.tier !== null && apiMode.pos !== null) {
                            const posPrefix = POS_MAP[apiMode.pos] || "";
                            player.ranks[jsonKey] = `${posPrefix}${apiMode.tier}`;
                        } else {
                            player.ranks[jsonKey] = "None";
                        }
                    });
                } catch (err) {
                    console.error(`❌ API error for ${player.name}`, err);
                }
            }

            // 6. LEADERBOARD GENERATION (Moved inside Fetch to use UUIDs)
            const sortedPlayers = Object.entries(scores).sort((a, b) => b[1] - a[1]);
            const tbody = document.querySelector('#overallLeaderboard tbody');
            tbody.innerHTML = ""; // Clear existing

            sortedPlayers.forEach(([player, score], idx) => {
                const tr = document.createElement('tr');
                if (idx === 0) tr.classList.add('top1');

                const pData = allPlayersData.find(p => p.name === player);
                const color = playerStyle[player]?.color || '#f0f0f0';
                const emoji = playerStyle[player]?.emoji ? playerStyle[player].emoji + " " : "";

                // 3D Head Render
                const avatarSrc = pData?.uuid 
                    ? `https://visage.surgeplay.com/bust/50/${pData.uuid}`
                    : 'img/default.png';

                const nameTd = document.createElement('td');
                nameTd.className = "name";
                nameTd.style.color = color;
                nameTd.innerHTML = `
                    <span>${emoji}</span>
                    <img src="${avatarSrc}" alt="${player}" onerror="this.src='img/default.png'">
                    ${player}
                `;

                if (idx === 0) {
                    const badge = document.createElement('span');
                    badge.className = 'master-badge';
                    badge.textContent = 'PVP MASTER';
                    nameTd.appendChild(badge);
                }

                const scoreTd = document.createElement('td');
                scoreTd.className = "points";
                scoreTd.textContent = score;

                tr.appendChild(nameTd);
                tr.appendChild(scoreTd);
                
                tr.addEventListener('click', () => {
                    if (pData?.uuid) window.open(`https://el.namemc.com/profile/${pData.uuid}`, '_blank');
                });
                tbody.appendChild(tr);
            });

            // 7. UPDATE TIERLIST SPANS
            Object.keys(modeMap).forEach(modeKey => {
                const ulId = modeMap[modeKey];
                const ul = document.getElementById(ulId);
                if (!ul) return;
                ul.querySelectorAll('li').forEach(li => {
                    const name = li.childNodes[0].textContent.trim();
                    const rankSpan = li.querySelector('.rank');
                    const player = players.find(p => p.name === name);
                    if (player && player.ranks[ulId] && player.ranks[ulId] !== "None") {
                        rankSpan.textContent = `[Tier: ${player.ranks[ulId]}]`;
                    } else if (rankSpan) {
                        rankSpan.textContent = '';
                    }
                });
            });

            // 8. HOVER POPUP SETUP
            document.querySelectorAll('.tierlists li').forEach(li => {
                li.addEventListener('mouseenter', () => {
                    const playerName = li.childNodes[0].textContent.trim();
                    const pData = allPlayersData.find(p => p.name === playerName);
                    const playerPoints = scores[playerName] || 0;
                    
                    const avatarPath = pData?.uuid 
                        ? `https://visage.surgeplay.com/bust/100/${pData.uuid}` 
                        : 'img/default.png';

                    const ulId = li.parentElement.id;
                    let rankText = (pData?.ranks && pData.ranks[ulId] !== "None") ? pData.ranks[ulId] : "";

                    tooltip.innerHTML = `
                        <img src="${avatarPath}" alt="${playerName}">
                        <div>
                            <span style="font-weight:700; font-size: 18px; color:${playerStyle[playerName]?.color || '#fff'};">${playerName}</span><br>
                            <span style="font-size: 11px; color: rgba(255,255,255,0.5); font-family: monospace;">${pData?.uuid || 'N/A'}</span><br>
                            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 5px 0;">
                            <span style="font-size: 14px;">Points: <strong>${playerPoints}</strong></span><br>
                            ${rankText ? `<span style="font-size: 14px;">Rank: <strong>${rankText}</strong></span>` : ''}
                        </div>
                    `;
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'scale(1)';
                });

                li.addEventListener('mousemove', e => {
                    tooltip.style.left = e.pageX + 15 + 'px';
                    tooltip.style.top = e.pageY + 15 + 'px';
                });

                li.addEventListener('mouseleave', () => {
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'scale(0.9)';
                });

                li.addEventListener('click', () => {
                    const playerName = li.childNodes[0].textContent.trim();
                    const pData = allPlayersData.find(p => p.name === playerName);
                    if (pData?.uuid) window.open(`https://el.namemc.com/profile/${pData.uuid}`, '_blank');
                });
            });
        });

    /* ================================
       9. ICON ΣΤΑ H2 (Visual only)
    ================================= */
    document.querySelectorAll('.tierlists h2').forEach(h2 => {
        const ul = h2.nextElementSibling;
        if (!ul || !ul.id) return;
        const img = document.createElement('img');
        img.src = `img/tier/${ul.id}.png`;
        img.width = 50; img.height = 50;
        img.style.borderRadius = '50%';
        img.style.marginRight = '10px';
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.appendChild(img);
        wrapper.appendChild(document.createTextNode(h2.textContent));
        h2.textContent = '';
        h2.appendChild(wrapper);
    });
});