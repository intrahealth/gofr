import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/index.js',
    output: {
        name: 'VEthiopianDatePicker',
        exports: 'named',
        file: 'dist/v-ethiopian-date-picker.esm.js',
        format: 'esm'// "amd", "cjs", "system", "", "iife" or "umd"
    },
    plugins: [
        commonjs(),
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        })
    ],
    external: [
        'vuetify/lib',
        'ethiopic-calendar',
        'vuetify/lib/components/VDatePicker/util',
        'vuetify/lib/components/VDatePicker/util/isDateAllowed'
    ]
}
