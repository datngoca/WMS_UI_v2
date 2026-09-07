const path = require("path");
const fs = require('fs');

// Helper read list sub-folders
const getDirectories = (sourcePath) => {
    if (!fs.existsSync(sourcePath)) return [];
    return fs.readdirSync(sourcePath, { withFileTypes: true })
        .filter((dirnent) => dirnent.isDirectory())
        .map((dirnent) => dirnent.name);
}

const featuresDir = path.join(process.cwd(), 'src', 'features');
const features = getDirectories(featuresDir);

const foldersDir = path.join(process.cwd(), 'src', 'components');
const folders = getDirectories(foldersDir);


const CREATE_NEW_FOLDER_KEY = '[+ Create new folder]';
const ROOT_FOLDER_KEY = '[Root: src/components]';

/*
*
* @type {import('plop').PlopConfig}
*
*/
module.exports = {
    description: 'Generate a new component',
    prompts: [
        {
            type: 'input',
            name: 'name',
            message: 'Enter a component name',
            validate: (value) => {
                if (!value || !value.trim()) {
                    return 'Please enter a component name';
                }
                return true;
            }
        },
        {
            type: 'list',
            name: 'feature',
            message: 'Which feature does this component belong to?',
            choices: () => {
                return ["components", ...features];
            },
            when: () => features.length > 0
        },
        // 1. Cho chọn folder có sẵn nếu thuộc 'components'
        {
            type: 'list',
            name: 'selectedFolder',
            message: 'Folder in component?',
            when: ({ feature }) => !feature || feature === 'components',
            choices: () => {
                return [ROOT_FOLDER_KEY, ...folders, CREATE_NEW_FOLDER_KEY];
            }
        },
        // 2. Hỏi tạo folder mới nếu chọn CREATE_NEW_FOLDER_KEY
        {
            type: 'input',
            name: 'newFolder',
            message: 'Enter new folder name (relative to src/components/):',
            when: ({ feature, selectedFolder }) => (!feature || feature === 'components') && selectedFolder === CREATE_NEW_FOLDER_KEY,
            validate: (value) => {
                if (!value || !value.trim()) {
                    return 'Please enter a folder name';
                }
                return true;
            }
        },
    ],
    actions: (answers) => {
        // Xác định folder trong src/components/
        let componentFolder = '';
        if (answers.selectedFolder === CREATE_NEW_FOLDER_KEY) {
            componentFolder = answers.newFolder.trim();
        } else if (answers.selectedFolder === ROOT_FOLDER_KEY) {
            componentFolder = '';
        } else {
            componentFolder = answers.selectedFolder || '';
        }

        const componentGeneratePath = !answers.feature || answers.feature === 'components'
            ? `src/components/${componentFolder}`
            : 'src/features/{{feature}}';
        return [
            {
                type: 'add',
                path: componentGeneratePath + '/{{kebabCase name}}/index.ts',
                templateFile: 'generators/component/index.ts.hbs'
            },
            {
                type: 'add',
                path: componentGeneratePath + '/{{kebabCase name}}/{{kebabCase name}}.stories.tsx',
                templateFile: 'generators/component/component.stories.tsx.hbs'
            },
            {
                type: 'add',
                path: componentGeneratePath + '/{{kebabCase name}}/{{kebabCase name}}.tsx',
                templateFile: 'generators/component/component.tsx.hbs'
            }
        ]
    }
}
