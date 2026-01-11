const scenes = [
    {
        name: "intro",
        duration: 10000,
        narration: "Hello! I am Antigravity, an advanced agentic AI coding assistant designed by Google DeepMind. I'm not just a chatbot; I'm a powerful collaborator capable of planning, executing, and verifying complex coding tasks alongside you.",
        render: (ctx, progress, width, height) => {
            // Google-themed gradient
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4285F4'); // Google Blue
            gradient.addColorStop(0.5, '#EA4335'); // Google Red
            gradient.addColorStop(1, '#FBBC05'); // Google Yellow
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            const scale = 0.5 + (Math.min(progress * 1.5, 1) * 0.5);
            ctx.translate(width / 2, height / 2);
            ctx.scale(scale, scale);

            ctx.fillStyle = 'white';
            ctx.font = 'bold 110px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('ANTIGRAVITY', 0, -60);

            ctx.font = '60px Arial';
            ctx.fillText('Agentic AI Assistant', 0, 40);

            ctx.font = '40px Arial';
            ctx.fillText('by Google DeepMind', 0, 110);
            ctx.restore();

            CaptionRenderer.renderCenteredCaption(ctx, scenes[0].narration, width, height, progress);
        }
    },
    {
        name: "agentic-capabilities",
        duration: 12000,
        narration: "What makes me 'agentic'? Unlike standard models that just predict text, I have agency. I can explore your codebase, read files, run terminal commands, and even create my own plans. I work in loops: thinking, acting, and observing results until the job is done.",
        render: (ctx, progress, width, height) => {
            ctx.fillStyle = '#202124'; // Dark background
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#8AB4F8';
            ctx.font = 'bold 70px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Agentic Capabilities', width / 2, 130);

            const nodes = [
                { text: 'Think', x: width * 0.2, y: height / 2, color: '#F1F3F4' },
                { text: 'Act', x: width * 0.5, y: height / 2, color: '#8AB4F8' },
                { text: 'Observe', x: width * 0.8, y: height / 2, color: '#F1F3F4' }
            ];

            // Draw arrows
            ctx.beginPath();
            ctx.moveTo(width * 0.25, height / 2);
            ctx.lineTo(width * 0.45, height / 2);
            ctx.moveTo(width * 0.55, height / 2);
            ctx.lineTo(width * 0.75, height / 2);
            ctx.strokeStyle = '#5F6368';
            ctx.lineWidth = 5;
            ctx.stroke();

            nodes.forEach((node, index) => {
                const delay = index * 0.3;
                const nodeProgress = Math.max(0, Math.min(1, (progress - delay) / 0.2));

                ctx.save();
                ctx.globalAlpha = nodeProgress;
                ctx.fillStyle = node.color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 80, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#202124';
                ctx.font = 'bold 30px Arial';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.text, node.x, node.y);
                ctx.restore();
            });

            CaptionRenderer.renderCaption(ctx, scenes[1].narration, width, height, progress);
        }
    },
    {
        name: "artifacts-system",
        duration: 14000,
        narration: "I keep us organized using Artifacts. These are live documents like Task Lists, Implementation Plans, and Walkthroughs. They live in your workspace, updating as we progress. This ensures we never lose context, even during long, complex coding sessions.",
        render: (ctx, progress, width, height) => {
            ctx.fillStyle = '#202124';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#F28B82'; // Reddish
            ctx.font = 'bold 70px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('The Artifact System', width / 2, 130);

            const artifacts = [
                { name: 'task.md', desc: 'Track Progress', color: '#81C995' }, // Green
                { name: 'implementation_plan.md', desc: 'Design First', color: '#FDD663' }, // Yellow
                { name: 'walkthrough.md', desc: 'Verify Results', color: '#8AB4F8' } // Blue
            ];

            artifacts.forEach((art, index) => {
                const y = 250 + (index * 120);
                const x = width / 2;

                if (progress > index * 0.25) {
                    ctx.fillStyle = art.color;
                    ctx.fillRect(x - 300, y - 40, 600, 80);

                    ctx.fillStyle = '#202124';
                    ctx.font = 'bold 30px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText(art.name, x - 280, y + 10);

                    ctx.font = 'italic 25px Arial';
                    ctx.textAlign = 'right';
                    ctx.fillText(art.desc, x + 280, y + 10);
                }
            });

            CaptionRenderer.renderCaption(ctx, scenes[2].narration, width, height, progress);
        }
    },
    {
        name: "planning-execution-verification",
        duration: 14000,
        narration: "I operate in three distinct modes: Planning, where I design the solution; Execution, where I write the code; and Verification, where I confirm everything works. This structured approach minimizes errors and maximizes code quality.",
        render: (ctx, progress, width, height) => {
            ctx.fillStyle = '#202124';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#81C995'; // Green
            ctx.font = 'bold 70px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('The Core Loop', width / 2, 130);

            const attributes = [
                'Structured Planning',
                'Iterative Execution',
                'Rigorous Verification',
                'Self-Correction',
                'Project-Level Understanding'
            ];

            // DNA Helix-like animation
            attributes.forEach((attr, index) => {
                const delay = index * 0.2;
                const attrProgress = Math.max(0, Math.min(1, (progress - delay) / 0.3));

                const offset = Math.sin((progress * 2 + index) * Math.PI) * 50;
                const y = 280 + (index * 100);

                ctx.save();
                ctx.globalAlpha = attrProgress;
                ctx.fillStyle = '#E8EAED';
                ctx.font = '40px Arial';
                ctx.fillText(attr, width / 2 + offset, y);
                ctx.restore();
            });

            CaptionRenderer.renderCaption(ctx, scenes[3].narration, width, height, progress);
        }
    },
    {
        name: "tools-and-environment",
        duration: 14000,
        narration: "I have direct access to a secure shell environment. I can install packages, run builds, check git status, and verify file contents. This allows me to act as a true pair programmer, handling the tedious setup and verification steps for you.",
        render: (ctx, progress, width, height) => {
            ctx.fillStyle = '#202124';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#FDD663'; // Yellow
            ctx.font = 'bold 70px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Tools & Environment', width / 2, 130);

            // Terminal simulation
            const boxX = 200;
            const boxY = 220;
            const boxWidth = width - 400;
            const boxHeight = 450;

            ctx.fillStyle = 'black';
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            ctx.strokeStyle = '#5F6368';
            ctx.lineWidth = 4;
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            ctx.font = '30px Courier New';
            ctx.textAlign = 'left';

            const commands = [
                { text: '$ npm install dependencies', color: '#F1F3F4', delay: 0 },
                { text: '> Added 42 packages in 2s', color: '#81C995', delay: 0.2 },
                { text: '$ git status', color: '#F1F3F4', delay: 0.4 },
                { text: '> On branch main', color: '#8AB4F8', delay: 0.5 },
                { text: '$ ./run_tests.sh', color: '#F1F3F4', delay: 0.7 },
                { text: '> All tests passed!', color: '#81C995', delay: 0.9 }
            ];

            commands.forEach((cmd, index) => {
                const lineProgress = Math.max(0, Math.min(1, (progress - cmd.delay) / 0.15));
                ctx.globalAlpha = lineProgress;
                ctx.fillStyle = cmd.color;
                ctx.fillText(cmd.text, boxX + 40, boxY + 60 + (index * 50));
            });
            ctx.globalAlpha = 1;

            CaptionRenderer.renderCaption(ctx, scenes[4].narration, width, height, progress);
        }
    },
    {
        name: "outro",
        duration: 10000,
        narration: "I am here to help you build faster, cleaner, and more ambitious software. Whether you're debugging a tricky error or architecting a new system, I'm ready to assist. Let's write some code!",
        render: (ctx, progress, width, height) => {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#4285F4');
            gradient.addColorStop(0.5, '#EA4335');
            gradient.addColorStop(1, '#FBBC05');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.05;
            ctx.translate(width / 2, height / 2);
            ctx.scale(pulse, pulse);

            ctx.fillStyle = 'white';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Ready to Collaborate?', 0, -50);

            ctx.font = '50px Arial';
            ctx.fillText('Give me a task!', 0, 50);
            ctx.restore();

            CaptionRenderer.renderCenteredCaption(ctx, scenes[5].narration, width, height, progress);
        }
    }
];