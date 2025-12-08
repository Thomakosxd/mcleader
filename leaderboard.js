document.addEventListener('DOMContentLoaded', () => {
    // Ρυθμίσεις πόντων
    const points = [5, 3, 2]; // 1η, 2η, 3η θέση
    const defaultPoint = 1;   // 4η και κάτω

    // Όλες οι λίστες
    const tierlists = [
        'maceTier', 'swordTier', 'axeTier', 'smpTier', 'nethPot', 'endCrystal', 'uhcTier'
    ];

    const scores = {}; // αντικείμενο για συνολικά σκορ

    // Υπολογισμός πόντων
    tierlists.forEach(id => {
        const ul = document.getElementById(id);
        const items = ul.querySelectorAll('li');

        items.forEach((li, index) => {
            // Παίρνει μόνο το κείμενο του li χωρίς τα παιδιά (δηλ. αγνοεί το <span class="rank">)
            const player = li.firstChild.textContent.trim();
        
            let point = defaultPoint;
            if (index < points.length) point = points[index];
        
            if (!scores[player]) scores[player] = 0;
            scores[player] += point;
        });        
    });

    // Ταξινόμηση ανάλογα με τους πόντους
    const sortedPlayers = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // Φάκελος avatars
    const avatarFolder = 'avatars/';

    // Γέμισμα του leaderboard
    const tbody = document.querySelector('#overallLeaderboard tbody');
    sortedPlayers.forEach(([player, score], idx) => {
        const tr = document.createElement('tr');
        if (idx === 0) tr.classList.add('top1'); // highlight πρώτου

        // Δημιουργία avatar εικόνας
        const avatar = document.createElement('img');
        avatar.src = `${avatarFolder}${player.toLowerCase()}.png`; // πχ avatars/leo.png
        avatar.alt = player;
        avatar.width = 50;
        avatar.height = 50;
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '10px';

        // Δημιουργία κελιού με avatar + όνομα
        const nameTd = document.createElement('td');
        nameTd.style.display = 'flex';
        nameTd.style.alignItems = 'center';
        nameTd.appendChild(avatar);
        nameTd.appendChild(document.createTextNode(player));

        // Κελί για score
        const scoreTd = document.createElement('td');
        scoreTd.textContent = score;

        tr.appendChild(nameTd);
        tr.appendChild(scoreTd);

        tbody.appendChild(tr);
    });

    // Προσθήκη εικόνων δίπλα στα H2 των tierlists
    const tierlistsH2 = document.querySelectorAll('.tierlists h2');

    tierlistsH2.forEach(h2 => {
        const ul = h2.nextElementSibling;
        if (!ul) return;

        const id = ul.id; // παίρνει το id του ul για να βρει την εικόνα
        const img = document.createElement('img');
        img.src = `/img/${id}.png`; // π.χ. /img/maceTier.png
        img.alt = id;
        img.width = 50;
        img.height = 50;
        img.style.borderRadius = '50%';
        img.style.marginRight = '10px';
        img.style.verticalAlign = 'middle';

        // Δημιουργία wrapper για flex
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.appendChild(img);
        wrapper.appendChild(document.createTextNode(h2.textContent));

        // Αντικαθιστούμε το h2 με το νέο wrapper
        h2.textContent = '';
        h2.appendChild(wrapper);
    });

});
