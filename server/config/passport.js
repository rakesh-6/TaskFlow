import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.model.js';

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({
                        $or: [
                            { email: profile.emails[0].value },
                            { googleId: profile.id }
                        ]
                    });

                    if (user) {
                        return done(null, user);
                    }

                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        isVerified: true,
                        avatar: profile.photos[0]?.value,
                    });

                    await user.save();
                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
} else {
    console.warn('⚠️ Google OAuth credentials missing. Google Login will be disabled.');
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your_github_client_id') {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: '/api/auth/github/callback',
                scope: ['user:email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const primaryEmail = profile.emails?.find((e) => e.primary)?.value || profile.emails?.[0]?.value || `${profile.username}@github.com`;

                    let user = await User.findOne({ email: primaryEmail });

                    if (user) {
                        return done(null, user);
                    }

                    user = new User({
                        name: profile.displayName || profile.username,
                        email: primaryEmail,
                        isVerified: true,
                        avatar: profile.photos?.[0]?.value,
                    });

                    await user.save();
                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
} else {
    console.warn('⚠️ GitHub OAuth credentials missing. GitHub Login will be disabled.');
}

export default passport;
