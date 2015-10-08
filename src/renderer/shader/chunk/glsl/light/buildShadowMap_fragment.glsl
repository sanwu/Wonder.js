@funcDefine
// Packing a float in GLSL with multiplication and mod
vec4 packDepth(in float depth) {
    const vec4 bit_shift = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
    const vec4 bit_mask = vec4(0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);

    // combination of mod and multiplication and division works better
    vec4 res = mod(depth * bit_shift * vec4(255), vec4(256) ) / vec4(255);
    res -= res.xxyz * bit_mask;

    return res;
}

@end

@body
//gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);
gl_FragColor = packDepth(gl_FragCoord.z);
@end